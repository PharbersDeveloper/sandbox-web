import DS from 'ember-data';

export default DS.Model.extend({
    fileName: DS.attr("string"),
    extension: DS.attr("string"),
    uploaded: DS.attr("number"),
    size: DS.attr("number"),
    url: DS.attr("string")
});
