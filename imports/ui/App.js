import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
 
import Task from './Task.js';
import { Tasks } from '../api/tasks.js';

import { Meteor } from 'meteor/meteor';
import AccountsUIWrapper from './AccountsUIWrapper.js';
 
class App extends Component {
    constructor(props){
        super(props);
        this.state = {
            newTask: "",
                hideCompleted: false,
        }
    }

    toggleHideCompleted() {
        this.setState({
          hideCompleted: !this.state.hideCompleted,
        });
      }

  renderTasks() {
      let filteredTasks = this.props.tasks;
    if (this.state.hideCompleted) {
      filteredTasks = filteredTasks.filter(task => !task.checked);
    }
    return filteredTasks.map((task) => {
        const currentUserId = this.props.currentUser && this.props.currentUser._id;
        const showPrivateButton = task.owner === currentUserId;
   
        return (
          <Task
            key={task._id}
            task={task}
            showPrivateButton={showPrivateButton}
          />
        );
      });
  }

  handleSubmit(event) {
    event.preventDefault();
 
    var newTask = this.state.newTask;
    if(newTask){    
        Meteor.call('tasks.insert', newTask);
    }

    this.setState({newTask: ""});
  }
 
  render() {
    return (
      <div className="container">
        <header>
          
         <h1>Todo List ({this.props.incompleteCount})</h1>
          <label className="hide-completed">
            <input
              type="checkbox"
              readOnly
              checked={this.state.hideCompleted}
              onClick={this.toggleHideCompleted.bind(this)}
            />
            Hide Completed Tasks
          </label>

            <AccountsUIWrapper/>
            { this.props.currentUser ?
          <form className="new-task" onSubmit={this.handleSubmit.bind(this)} >
            <input
              type="text"
              ref="textInput"
              value={this.state.newTask}
              onChange={(e) => this.setState({newTask: e.target.value})}
              placeholder="Type to add new tasks"
            />
            </form> : ''}
        </header>
 
        <ul>
          {this.renderTasks()}
        </ul>
      </div>
    );
  }
}

export default withTracker(() => {
    Meteor.subscribe('tasks');
    return {
        tasks: Tasks.find({}, { sort: { createdAt: -1 } }).fetch(),
        incompleteCount: Tasks.find({ checked: { $ne: true } }).count(),
        currentUser: Meteor.user(),
    };
})(App);