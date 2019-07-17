import DS from "ember-data";

export default DS.Model.extend({
	parent: DS.attr("string"),
	size: DS.attr("number"),
	where: DS.attr("string"),
	kind: DS.attr("string"),
	tag: DS.attr("string")
});
