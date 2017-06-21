import edit_button from '../edit_button.html';

export default function (nga, admin) {
	var groups = admin.getEntity('Groups');
	groups.listView()
			.title('<h4>User Groups <i class="fa fa-angle-right" aria-hidden="true"></i> List</h4>')
			.actions([])
			.batchActions([])
			.fields([
				nga.field('name', 'string')
						.label('Name'),
				nga.field('code', 'string')
						.label('Role'),
				nga.field('isavailable', 'boolean')
						.validation({ required: true })
						.label('Available'),
			])
			.listActions(['edit'])

	groups.editionView()
			.title('<h4>Genres <i class="fa fa-angle-right" aria-hidden="true"></i> Edit: {{ entry.values.description }}</h4>')
			.actions(['list'])
			.fields([
				groups.listView().fields(),
				nga.field('template')
						.label('')
						.template(edit_button),
				nga.field('', 'referenced_list')
						.label('Test')
						.targetEntity(admin.getEntity('Grouprights'))
						.targetReferenceField('group_id')
						.targetFields([
							nga.field('id', 'number')
									.label('ID'),
							nga.field('api_url', 'string')
									.label('Api Url'),
							nga.field('description', 'string')
									.label('Description'),
							nga.field('grouprights.id', 'template')
									//.map(function truncate(value) {
									//	console.log('vlera = ',value);
									//})
									.label('Permitions ')
									.template('<approve-review size="xs" review="entry"></approve-review>'),

						]),

			])




	return groups;

}