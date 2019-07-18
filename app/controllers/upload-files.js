import Controller from "@ember/controller";
import { inject as service } from "@ember/service";

export default Controller.extend({
	ossService: service(),
	ajax: service(),
	cookies: service(),
	store: service(),
	uploadMessage: {},
	downloadURI(url, name) {
		fetch(url)
			.then(response => {
				if (response.status == 200) return response.blob();
				throw new Error(`status: ${response.status}`);
			})
			.then(blob => {
				var link = document.createElement("a");
				link.download = name;
				// var blob = new Blob([response]);
				link.href = URL.createObjectURL(blob);
				// link.href = url;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				// delete link;
				this.set("isLoading", false);
				this.set("cur_page_idx", 3);
				window.console.log("success");
			})
			.catch(error => {
				this.set("isLoading", false);
				window.console.log("failed. cause:", error);
			});
	},
	genDownloadUrl() {
		let accept = "pdf";
		let uuid = "Blue Book.pdf";
		let client = this.ossService.get("ossClient");
		let url = client.signatureUrl(accept + "/" + uuid, { expires: 43200 });
		window.console.log(url);
		return url;
	},
	actions: {
		downloadFile() {
			this.set("isLoading", true);
			this.downloadURI(this.genDownloadUrl(), "Blue Book.pdf");
		},
		updateFiles() {
			let radioList = document.getElementsByClassName("updateRadio");
			radioList.forEach(element => {
				window.console.log(element);
				if (element.checked) {
					return true;
				} else {
					return false;
				}
			});
		},
		uploadFiles() {
			const ajax = this.get("ajax");
			let client = this.ossService.get("ossClient");
			this.uploadMessage.accountId = this.cookies.read("account_id");
			this.uploadMessage.file = document.getElementById("myFile").files[0];
			this.uploadMessage.update = false;

			let a = document.getElementsByClassName("updateRadio");
			for (let i = 0; i < a.length; i++) {
				window.console.log(a[i].name);
				if (a[i].checked) {
					this.uploadMessage.update = true;
					this.uploadMessage.updateKey = a[i].name;
					break;
				}
			}

			// return;
			ajax
				.post("/v0/GetAccountDetail", {
					data: { accountId: this.uploadMessage.accountId }
				})
				.then(response => {
					this.uploadMessage.groupId = response["group-id"];
				});

			ajax
				.post("/v0/GenerateLink", {
					data: { account_id: this.uploadMessage.accountId }
				})
				.then(response => {
					let store = this.get("store");
					let { bucket, link } = response,
						name = new Date().getTime();
					let uploadLink = link + "/" + name;

					window.console.log(this.uploadMessage.update);
					let uploadMessage = this.uploadMessage;
					window.console.log(uploadMessage);

					async function put() {
						try {
							// object表示上传到OSS的名字，可自己定义
							// file浏览器中需要上传的文件，支持HTML5 file 和 Blob类型
							let r1 = await client.put(uploadLink, uploadMessage.file);
							// after upload success
							window.console.log("put success: %j", r1);

							// change function  >>> peek
							let sandBoxIndexRes = await ajax.request("v0/sandBoxIndices", {
								data: {
									account_id: uploadMessage.accountId
								}
							});
							window.console.log(sandBoxIndexRes.data.length);
							let nowSandBoxIndex = (function () {
								if (sandBoxIndexRes.data.length === 0) {
									return store.createRecord("sand-box-index", {
										accountId: uploadMessage.accountId
									});
								} else {
									return store.peekAll("sand-box-index").objectAt(0);
									// nowSandBoxIndex = a[0];
								}
							})();

							let newFileVersion = store.createRecord("file-version", {
								// newFileVersion need parent version id, kind
								size: uploadMessage.file.size,
								where: bucket + "/" + uploadLink,
								tag: new Date().getTime() + uploadMessage.file.name
							});

							if (uploadMessage.update) {
								// update files, search datun >>> version list

								let datum = await store.peekRecord(
									"file-meta-datum",
									uploadMessage.updateKey
								);
								let versionList = await datum.get("fileVersions");
								window.console.log(datum);
								newFileVersion.set(
									"parent",
									versionList.objectAt(versionList.length - 1).id
								);
								datum.get("fileVersions").pushObject(newFileVersion);
								// window.consoe.log(".");

								newFileVersion.save().then(function () {
									window.console.log("create fileVersion ok");
									datum.save().then(function () {
										window.console.log("update fileMetaDatum ok");
										nowSandBoxIndex.save().then(function () {
											if (sandBoxIndexRes.data.length === 0) {
												window.console.log("create fileMetaDatum ok");
											} else {
												window.console.log("update fileMetaDatum ok");
											}
										});
									});
								});
							} else {
								// if upload only, cerate new datum
								let newFileMetaDatum = store.createRecord("file-meta-datum", {
									name: uploadMessage.file.name,
									extension: uploadMessage.file.type,
									created: new Date().getTime(),
									ownerId: uploadMessage.accountId,
									groupId: uploadMessage.groupId
									// need mod
								});

								newFileMetaDatum.get("fileVersions").pushObject(newFileVersion);
								window.console.log(nowSandBoxIndex);
								nowSandBoxIndex
									.get("fileMetaDatas")
									.pushObject(newFileMetaDatum);

								newFileVersion.save().then(function () {
									window.console.log("create fileVersion ok");
									newFileMetaDatum.save().then(function () {
										window.console.log("create fileMetaDatum ok");
										nowSandBoxIndex.save().then(function () {
											if (sandBoxIndexRes.data.length === 0) {
												window.console.log("create sandBoxIndex ok");
											} else {
												window.console.log("update sandBoxIndex ok");
											}
										});
									});
								});
							}
						} catch (e) {
							window.console.error("error: %j", e);
						}
					}
					put();
				})
				.catch(e => {
					return e;
				});
		}
	}
});
