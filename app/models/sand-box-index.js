import DS from "ember-data";

export default DS.Model.extend({
	accountId: DS.attr("string"),
	fileMetaDatas: DS.hasMany("file-meta-datum")
});
