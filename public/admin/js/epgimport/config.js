import edit_button from '../edit_button.html';

export default function (nga, admin) {
    var epgImport = admin.getEntity('epgimport');
    epgImport.listView()
        .title('<h4>Epg Data <i class="fa fa-angle-right" aria-hidden="true"></i> List</h4>')
        .actions(['batch', 'create'])
        .fields([
            nga.field('channel_number')
                .cssClasses('hidden-xs')
                .label('Nr'),
            nga.field('title', 'string')
                .label('Title'),
            nga.field('short_name', 'string')
                .cssClasses('hidden-xs')
                .label('Short Name'),
            nga.field('short_description')
                .label('Short Description'),
            nga.field('program_start', 'datetime')
                .cssClasses('hidden-xs')
                .label('Program Start'),
            nga.field('program_end', 'datetime')
                .cssClasses('hidden-xs')
                .label('Program End'),
            nga.field('duration_seconds', 'number')
                .cssClasses('hidden-xs')
                .label('Duration'),
            nga.field('timezone', 'number')
                .map(function truncate(value) {
                    if (!value) {
                        return "No Timezone";
                    }
                })
                .cssClasses('hidden-xs')
                .label('Timezone'),
        ])
        .filters([
            nga.field('q')
                .label('')
                .template('<div class="input-group"><input type="text" ng-model="value" placeholder="Search" class="form-control"></input><span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span></div>')
                .pinned(true)])
        .listActions(['edit'])
        .exportFields([
            epgImport.listView().fields(),
        ]);


    epgImport.creationView()
        .title('<h4>Epg Data <i class="fa fa-angle-right" aria-hidden="true"></i> Import EPG</h4>')
        .fields([
            nga.field('channel_number', 'string')
                .attributes({ placeholder: 'Channel number' })
                .validation({ required: false })
                .label('Enter channel number'),
            nga.field('delete_existing', 'boolean')
                .attributes({ placeholder: 'deleteorappend' })
                .validation({ required: true })
                .label('Delete existing data'),
            nga.field('epg_file','file')
                .uploadInformation({ 'url': '/file-upload/single-file/epg/epg_file', 'accept': 'image/*, .csv, text/xml, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'apifilename': 'result'})
                .template('<div class="row">'+
                    '<div class="col-xs-12 col-sm-1"><img src="{{ entry.values.epg_file }}" height="40" width="40" /></div>'+
                    '<div class="col-xs-12 col-sm-8"><ma-file-field field="field" value="entry.values.epg_file"></ma-file-field></div>'+
                    '</div>')
                .validation({
                    validator: function(value) {
                        if (value == null) {
                            throw new Error('Please, choose file');
                        }
                    }
                })
                .label('File input *'),
            nga.field('template')
                .label('')
                .template(edit_button),
        ]);

    return epgImport;

}

