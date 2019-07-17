import Service from "@ember/service";
import { inject as service } from "@ember/service";
import ENV from "sandbox-web/config/environment";
import { isEmpty } from "@ember/utils";
import { A } from "@ember/array";
const { keys } = Object;

export default Service.extend({
	cookies: service(),
	ajax: service(),
	router: service(),
	groupName: "",
	version: "v0",
	clientId: ENV.clientId,
	clientSecret: "5c90db71eeefcc082c0823b2",
	status: "self",
	scope: "APP/SandBox",
	currentScope: "SandBox",
	host: ENV.host,
	redirectUri: ENV.redirectUri,
	// 返回授权码后通过重定位url 到oauth-callback
	oauthCallback(transition) {
		let version = `${this.get("version")}`,
			host = `${this.get("host")}`,
			resource = "GenerateAccessToken",
			url = "",
			cookies = this.get("cookies");

		const ajax = this.get("ajax"),
			{ queryParams } = transition;
		if (queryParams.code && queryParams.state) {
			url = `?client_id=${this.get("clientId")}
    			&client_secret=${this.get("clientSecret")}
    			&scope=${this.get("scope")}
    			&redirect_uri=${this.get("redirectUri")}/oauth-callback
    			&code=${queryParams.code}
    			&state=${queryParams.state}`
				.replace(/\n/gm, "")
				.replace(/ /gm, "")
				.replace(/\t/gm, "");
			ajax
				.request([host, version, resource, url].join("/"))
				.then(response => {
					this.removeAuth();
					let expiry = new Date(response.expiry),
						options = {
							domain: ".pharbers.com",
							path: "/",
							expires: expiry
							// maxAge: 10
						};
					// token令牌申请成功，写入 cookies
					cookies.write("token", response.access_token, options);
					cookies.write("account_id", response.account_id, options);
					cookies.write("access_token", response.access_token, options);
					cookies.write("refresh_token", response.refresh_token, options);
					cookies.write("token_type", response.token_type, options);
					cookies.write("scope", response.scope, options);
					cookies.write("expiry", response.expiry, options);

					this.get("router").transitionTo("upload-files");
				})
				.catch(() => {
					this.get("router").transitionTo("upload-files");
				});
		} else {
			this.get("router").transitionTo("upload-files");
		}
	},

	judgeAuth() {
		let tokenFlag = false,
			scopeFlag = false,
			token = this.get("cookies").read("access_token"),
			scope = this.get("cookies").read("scope"),
			currentScope = this.get("currentScope");

		if (!isEmpty(token)) {
			tokenFlag = true;
		}

		if (!isEmpty(scope)) {
			let scopeString = scope.split("/")[1],
				scopes = scopeString.split(",");

			scopes.forEach(elem => {
				let appScope = elem.split(":")[0],
					scopeGroup = elem.split(":")[1];

				if (
					appScope === currentScope &&
					scopeGroup !== "" &&
					typeof scopeGroup !== "undefined"
				) {
					scopeFlag = true;
				}
			});
			scope
				.split("/")[1]
				.split(",")
				.forEach(elem => {
					let appScope = elem.split(":")[0],
						scopeGroup = elem.split(":")[1];

					if (
						appScope === currentScope &&
						scopeGroup !== "" &&
						typeof scopeGroup !== "undefined"
					) {
						this.set("groupName", scopeGroup.split("#")[0]);
					}
				});
		}
		if (tokenFlag && scopeFlag) {
			return true;
		}
		return false;
	},

	removeAuth() {
		this.set("groupName", "");
		let options = { domain: ".pharbers.com", path: "/" },
			cookies = this.get("cookies").read(),
			totalCookies = A([]);

		totalCookies = keys(cookies).map(ele => ele);

		totalCookies.forEach(ele => {
			this.get("cookies").clear(ele, options);
		});
	}
});
