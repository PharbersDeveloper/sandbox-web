import Route from "@ember/routing/route";
import { inject as service } from "@ember/service";
import ENV from "sandbox-web/config/environment";

export default Route.extend({
	ajax: service(),
	clientId: ENV.clientId,
	clientSecret: "5c90db71eeefcc082c0823b2",
	showNav: false,
	host: ENV.host,
	redirectUri: ENV.redirectUri,
	model() {
		const ajax = this.get("ajax"),
			applicationAdapter = this.get("store").adapterFor("application");

		let host = `${this.get("host")}`,
			version = `${applicationAdapter.get("namespace")}`,
			resource = "Thirdparty",
			scope = `${applicationAdapter.get("scope")}`,
			url = "",
			redirectUri = `${this.get("redirectUri")}/oauth-callback`;
		// 向……发起请求，返回授权码，通过url跳转到oauth-callback
		url = `?client_id=${this.get("clientId")}
					&client_secret=${this.get("clientSecret")}
					&scope=${scope}
					&redirect_uri=${redirectUri}
					&status=self`
			.replace(/\n/gm, "")
			.replace(/ /gm, "")
			.replace(/\t/gm, "");
		return ajax
			.request([host, version, resource, url].join("/"), {
				dataType: "text"
			})
			.then(response => {
				return response;
			});
	}
});
