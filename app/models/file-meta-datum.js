import DS from "ember-data";

export default DS.Model.extend({
    name: DS.attr("string"),
    extension: DS.attr("string"),
    created: DS.attr("number"),
    kind: DS.attr("string"),
    ownerId: DS.attr("string"),
    groupId: DS.attr("string"),
    mod: DS.attr("string"),
    fileVersions: DS.hasMany("file-version")
});
