import DS from 'ember-data';

export default DS.Model.extend({
    traceId: DS.attr("string"),
    name: DS.attr("string"),
    description: DS.attr("string"),
    owner: DS.attr("string"),
    accessibility: DS.attr("string"),
    version: DS.attr("string"),
    dataType: DS.attr("string"),
    file: DS.belongsTo("file"),
    dfs: DS.hasMany("data-set"),
    providers: DS.attr(),
    markets: DS.attr(),
    molecules: DS.attr(),
    dataCover: DS.attr(),
    geoCover: DS.attr(),
    labels: DS.attr(),
});
