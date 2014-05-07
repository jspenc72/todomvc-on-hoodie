/*global angular */

/**
 * Services that persists and retrieves TODOs from localStorage
 */
angular.module('todomvc')
	.factory('todoStorage', function () {
		'use strict';

		var STORAGE_ID = 'todos-angularjs';

		// fake login, for syncing
		var hoodie = new Hoodie();


		return {
			get: function () {
				return hoodie.store.findAll('todo');

				// todomvc original
				// return JSON.parse(localStorage.getItem(STORAGE_ID) || '[]');
			},

			put: function (todo) {
				return hoodie.store.add('todo', todo);

				// todomvc original
				// localStorage.setItem(STORAGE_ID, JSON.stringify(todos));
			},

			remove: function (todo) {
				console.log('remove', todo);
				return hoodie.store.remove('todo', todo.id);

				// return JSON.parse(localStorage.getItem(STORAGE_ID) || '[]');
			},

			performDataSync: function(newList, oldList) {
				var that = this,
					newItems,
					updatedItems,
					deletedItems;

				newItems = newList.filter(function(todo) {
					// filter the new items. new items dont 
					// have an id yet
					
					return todo.id === undefined; 
				});

				updatedItems = newList.filter(function(todo, idx) {
					// filter updated items.
					// since the completed tad is eveything we 
					// can currently edit on an existig todo, 
					// we'take this as "changed/dirty" criteria

					return oldList[idx] != undefined && todo.completed != oldList[idx].completed;
				});

				deletedItems = oldList.filter(function(todo, idx) {
					// filter deleted items
					// since angular creates copies the array contents
					// We need can't use Array.indexOf here.
					var isDeleted = true,
						idx;

					for(idx = 0; idx < newList.length && isDeleted; ++idx) {
						if(newList[idx].id == todo.id) {
							isDeleted = false;
						}
					}

					return isDeleted;
				});

				// console.clear();
				// console.log('newItems', newItems);
				// console.log('updateItems', updatedItems);
				// console.log('deletedItems', deletedItems);

				newItems.forEach(function(todo) {
					that.put(todo).done(function(writtenTodo) {
						// console.log('newItem', writtenTodo);
					});
				});

				updatedItems.forEach(function(todo) {
					that.put(todo).done(function(updatedTodo){
						// console.log('updatedItem', updatedTodo);
					});
				});

				deletedItems.forEach(function(todo) {
					that.remove(todo).done(function(doneTodo) {
						// console.log('doneTodo', doneTodo);
					});
				})

				// since we use localstorage it doesn't 
				// hurt to pull the whole list again. \o/
				return that.get();
			}
		};
	});
