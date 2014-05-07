/*global angular */

/**
 * The main controller for the app. The controller:
 * - retrieves and persists the model via the todoStorage service
 * - exposes the model to the template and provides event handlers
 */
angular.module('todomvc')
	.controller('TodoCtrl', function TodoCtrl($scope, $routeParams, $filter, todoStorage) {
		'use strict';

		// var todos = $scope.todos = todoStorage.get();
		
		// start empty and update if ready
		var todos = $scope.todos = [];

		$scope.newTodo = '';
		$scope.editedTodo = null;

		$scope.$watch('todos', function (newTodoList, oldTodoList) {
			$scope.remainingCount = $filter('filter')(todos, { completed: false }).length;
			$scope.completedCount = todos.length - $scope.remainingCount;
			$scope.allChecked = !$scope.remainingCount;

			// this will just forcepush everything	
			// if (newValue !== oldValue) { // This prevents unneeded calls to the local storage
				// todoStorage.put(todos);
			// }
			
			// since we work with read entity data, we need to improve here
			todoStorage
				.performDataSync(newTodoList, oldTodoList)
				.done(function(storedTodos) {
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

			todos.push({
				title: newTodo,
				completed: false
			});

			$scope.newTodo = '';
		};

		$scope.updateTodoList = function updateTodoList() {
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
