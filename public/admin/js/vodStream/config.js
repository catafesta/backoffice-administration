import edit_button from '../edit_button.html';

export default function (nga, admin) {
	var vodstream = admin.getEntity('vodstreams');
	vodstream.listView()
		.title('<h4>Vod Streams <i class="fa fa-angle-right" aria-hidden="true"></i> List</h4>')
		.batchActions([])
		.fields([
			nga.field('vod_id', 'reference')
				.targetEntity(admin.getEntity('Vods'))
                .targetField(nga.field('title'))
				.label('Vod'),
			nga.field('stream_source_id', 'reference')
				.targetEntity(admin.getEntity('VodStreamSources'))
                .targetField(nga.field('description'))
				.label('Stream Source'),
			nga.field('url', 'string')
				.map(function truncate(value) {
                 	if (!value) {
                            return '';
                      	}
                            return value.length > 25 ? value.substr(0, 25) + '...' : value;
                      	})
				.label('Url'),
			nga.field('token', 'boolean')
				.label('Token'),
			nga.field('encryption', 'boolean')
				.label('Encryption'),
			nga.field('token_url', 'string')
				.label('Token Url'),
		])
		.listActions(['edit'])
		.exportFields([
         vodstream.listView().fields(),
        ]);

    vodstream.deletionView()
        .title('<h4>Vod Streams <i class="fa fa-angle-right" aria-hidden="true"></i> Remove <span style ="color:red;"> Vod Streams')
        .actions(['<ma-back-button entry="entry" entity="entity"></ma-back-button>'])

	vodstream.creationView()
		.title('<h4>Vod Streams <i class="fa fa-angle-right" aria-hidden="true"></i> Create: Vod Stream</h4>')            
        .fields([
            nga.field('vod_id', 'reference')
            	.targetEntity(admin.getEntity('Vods'))
                .targetField(nga.field('title'))
				.attributes({ placeholder: 'Vod' })
				.validation({ required: true })
				.label('Vod'),
			nga.field('stream_source_id', 'reference')
				.targetEntity(admin.getEntity('VodStreamSources'))
                .targetField(nga.field('description'))
				.attributes({ placeholder: 'Stream Source' })
				.validation({ required: true })
				.label('Stream Source'),
			nga.field('url', 'string')
				.attributes({ placeholder: 'Url' })
				.validation({ required: true })
				.label('Url'),
			nga.field('token', 'boolean')
				.attributes({ placeholder: 'Token' })
				.validation({ required: true })
				.label('Token'),
			nga.field('token_url', 'string')
				.attributes({ placeholder: 'Token Url' })
				.validation({ required: true })
				.label('Token Url'),
			nga.field('encryption', 'boolean')
				.validation({ required: true })
				.label('Encryption'),
            nga.field('template')
            	.label('')
            	.template(edit_button),
        ]);

    vodstream.editionView()
    	.title('<h4>Vod Streams <i class="fa fa-angle-right" aria-hidden="true"></i> Edit: {{ entry.values.vod_id }}</h4>')  
    	.actions(['list', 'delete'])         
        .fields([
            vodstream.creationView().fields(),
        ]);


	return vodstream;
	
}
