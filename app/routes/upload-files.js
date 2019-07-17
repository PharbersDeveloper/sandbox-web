import Route from "@ember/routing/route";
import { inject as service } from "@ember/service";

export default Route.extend({
	cookies: service(),
	beforeModel() {
		let cookies = this.get("cookies");
		if (!cookies.read("token")) {
			this.transitionTo("login");
		}
	},
	model() {
		let accountId = this.cookies.read("account_id");
		let store = this.store;
		async function getFiles() {
			try {
				let msg = [];
				let allIndex = await store.query("sand-box-index", {
					filter: {
						account_id: accountId
					}
				});
				let index = await allIndex.get("lastObject");
				let datas = await index.get("fileMetaDatas");
				await loop();
				// eslint-disable-next-line no-inner-declarations
				async function loop() {
					try {
						for (let i = 0; i < datas.length; i++) {
							let obj = {};
							let cur = datas.objectAt(i);
							let versions = await datas.objectAt(i).get("fileVersions");
							let v = versions.objectAt(versions.length - 1);
							obj.datumKey = cur.id;
							obj.name = cur.name;
							obj.size = v.size;
							window.console.log(obj);
							msg.push(obj);
						}
					} catch (error) {
						window.console.log(error);
					}
				}
				return msg;
			} catch (error) {
				window.console.log(error);
			}
		}
		return getFiles();
	}
});
