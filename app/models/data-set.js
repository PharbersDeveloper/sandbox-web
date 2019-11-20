import DS from 'ember-data';

export default DS.Model.extend({

    colNames: DS.attr("string"),
    length: DS.attr("number"),
    url: DS.attr("string"),
    description: DS.attr("string"),
    parent: DS.belongsTo("data-set"),
    jobId: DS.attr("string")
});
