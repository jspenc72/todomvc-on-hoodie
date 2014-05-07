/*global angular */

/**
 * The main controller for the app. The controller:
 * - retrieves and persists the model via the todoStorage service
 * - exposes the model to the template and provides event handlers
 */
angular.module('todomvc')
	.controller('TodoCtrl', function TodoCtrl($scope, $routeParams, $filter, todoStorage) {
		'use strict';

		// Start with an empty array. 
		// We will update this array when ready.
		// Angular will handle the UI updates for us then,
		// so it is ok to start out empty.
		var todos = $scope.todos = [];

		$scope.newTodo = '';
		$scope.editedTodo = null;

		$scope.$watch('todos', function (newTodoList, oldTodoList) {
			// This will watch the todos array for changes.
			// If changes occur, this will build some stats about
			// the todolist ... 
			$scope.remainingCount = $filter('filter')(todos, { completed: false }).length;
			$scope.completedCount = todos.length - $scope.remainingCount;
			$scope.allChecked = !$scope.remainingCount;
			
			// .. and communicates the updates to the store after that.
			todoStorage
				.performDataSync(newTodoList, oldTodoList)
				.done(function(storedTodos) {
					// Updating the complete todolist here is important,
					// since newly created data don't have a document id yet.
					// Using this way, we also get rid of already deleted objects,
					// that still invisibly lurk around in the array.
					
					todos = $scope.todos = storedTodos;
			});

		}, true);

		// Monitor the current route for changes and adjust the filter accordingly.
		$scope.$on('$routeChangeSuccess', function () {
			var status = $scope.status = $routeParams.status || '';

			$scope.statusFilter = (status === 'active') ?
				{ completed: false } : (status === 'completed') ?
				{ completed: true } : null;
		});

		$scope.addTodo = function () {
			var newTodo = $scope.newTodo.trim();
			if (!newTodo.length) {
				return;
			}

			// When adding a todo item, we just add a plain javascript object
			// to the todos array. Angular watches this and calls
			// todoStorage.performDataSync for us.
			todos.push({
				title: newTodo,
				completed: false
			});

			$scope.newTodo = '';
		};

		$scope.updateTodoList = function updateTodoList() {
			// Just read the todolist.
			todoStorage.get().done(function(storedTodos) {
				todos = $scope.todos = storedTodos;
			});
		};
		$scope.updateTodoList();


		$scope.editTodo = function (todo) {
			$scope.editedTodo = todo;
			// Clone the original todo to restore it on demand.
			$scope.originalTodo = angular.extend({}, todo);
		};

		$scope.doneEditing = function (todo) {
			$scope.editedTodo = null;
			todo.title = todo.title.trim();

			if (!todo.title) {
				$scope.removeTodo(todo);
			}
		};

		$scope.revertEditing = function (todo) {
			todos[todos.indexOf(todo)] = $scope.originalTodo;
			$scope.doneEditing($scope.originalTodo);
		};

		$scope.removeTodo = function (todo) {
			todos.splice(todos.indexOf(todo), 1);
		};

		$scope.clearCompletedTodos = function () {
			$scope.todos = todos = todos.filter(function (val) {
				return !val.completed;
			});
		};

		$scope.markAll = function (completed) {
			todos.forEach(function (todo) {
				todo.completed = !completed;
			});
		};

	});
