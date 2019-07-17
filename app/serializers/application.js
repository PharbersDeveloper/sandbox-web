import DS from "ember-data";
import { camelize } from "@ember/string";
import { pluralize, singularize } from "ember-inflector";

export default DS.JSONAPISerializer.extend({
	modelNameFromPayloadKey(key) {
		return singularize(key);
	},

	payloadKeyFromModelName(modelName) {
		return pluralize(camelize(modelName));
	},
	// keyForAttribute(key) {
	//   let newKey = camelize(key);
	//   return capitalize(newKey);
	// }
	keyForRelationship(key) {
		// debugger;
		// if (key == "file-meta-data") {
		//   console.log("fxxk");
		// }
		// return dasherize(singularize(key));
		return key;
	}
});
