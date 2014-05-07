/*global angular */

/**
 * Services that persists and retrieves TODOs from localStorage
 */
angular.module('todomvc')
	.factory('todoStorage', function () {
		'use strict';

		// fake login, for syncing
		var hoodie = new Hoodie();

		return {
			get: function () {
				// Simple get all the local documents of type todo.
				// This returns a promise you may use 
				// to start further operations when findAll is done.
				
				return hoodie.store.findAll('todo');
			},

			put: function (todo) {
				// This will save a single document of type todo.
				// When the function parameter "todo" is a 
				// plain javascript object, this will create a new
				// todo document. This will also return a promise,
				// you can rely on for further operations.
				
				return hoodie.store.add('todo', todo);
			},

			remove: function (todo) {
				// This will remove a single document of type todo
				// identified by it's document id. In this case todo.id.
				// This will also return a promise,
				// you can rely on for further operations.
				
				return hoodie.store.remove('todo', todo.id);
			},

			performDataSync: function(newList, oldList) {
				// This is a convenient method to update the whole dataset.
				// Since the AngularJS version of the todolist example uses
				// $scope.watch('todo') to identify changes that have applied
				// to the todo collection, we must figure out wich documents
				// to create, update or just delete.

				var that = this,
					newItems,
					updatedItems,
					deletedItems;

				newItems = newList.filter(function(todo) {
					// Filter the new items. New items dont 
					// have an id yet.
					
					return todo.id === undefined; 
				});

				updatedItems = newList.filter(function(todo, idx) {
					// Filter updated items.
					// Since the "completed task option" is eveything we 
					// can currently edit on an existig todo item, 
					// we take this as "changed/dirty" criteria.

					return oldList[idx] != undefined && todo.completed != oldList[idx].completed;
				});

				deletedItems = oldList.filter(function(todo, idx) {
					// Filter deleted items.
					// Since Angular creates copies of the array contents,
					// we need can't use Array.indexOf here.
					
					var isDeleted = true,
						idx;

					for(idx = 0; idx < newList.length && isDeleted; ++idx) {
						if(newList[idx].id == todo.id) {
							isDeleted = false;
						}
					}

					return isDeleted;
				});

				// At the end apply the operations.
				// Since the UI is limited to a single 
				// operations at a time, usually only on 
				// operation will be done.
				// 
				// By choosings this method we are still save
				// for multiple item changes, too.
				
				newItems.map(this.put);
				updatedItems.map(this.put);
				deletedItems.map(this.remove);

				// Since we use local storage it doesn't 
				// hurt to pull the whole list again. \o/
				// This is ways more consistent than 
				// merging and fiddling with multiple arrays.
				// This will return a promise, too.
				
				return that.get();
			}
		};
	});
