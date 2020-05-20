import { Meteor } from 'meteor/meteor';
 
import { Random } from 'meteor/random';
 
import { Tasks } from './tasks.js';
import { assert } from 'chai';
import { Accounts } from 'meteor/accounts-base';
 
if (Meteor.isServer) {
  describe('Tasks', () => {
    describe('methods', () => {
        let userId;
        let taskId;    

      beforeEach( async () => {
        userId = await Accounts.createUser({username: 'piotr', password: 'test'});
        Tasks.remove({});
        taskId = Tasks.insert({
          text: 'test task',
          createdAt: new Date(),
          owner: userId,
          username: "piotr",
        });
      });

      afterEach( () => {
          Meteor.users.remove(userId);
      })
 
      it('can delete owned task', () => {
        // Find the internal implementation of the task method so we can
        // test it in isolation
        const deleteTask = Meteor.server.method_handlers['tasks.remove'];
 
        // Set up a fake method invocation that looks like what the method expects
        const invocation = { userId };
 
        // Run the method with `this` set to the fake invocation
        deleteTask.apply(invocation, [taskId]);
 
        // Verify that the method does what we expected
        assert.equal(Tasks.find({}).count(), 0);
      });

      it('can add owned task', () => {
          const addTask = Meteor.server.method_handlers['tasks.insert'];
          
          const invocation = { userId };

          addTask.apply(invocation, ["test test"])

          assert.equal(Tasks.find({}).count(), 2);
      })

      it('can set task as private', () => {
        const setPrivate = Meteor.server.method_handlers['tasks.setPrivate'];

        const invocation = {userId};

        setPrivate.apply(invocation, [taskId, true])

        assert.equal(Tasks.findOne({_id: taskId}).private, true);
      })

      it('can set task as not private', () => {
        const setPrivate = Meteor.server.method_handlers['tasks.setPrivate'];

        const invocation = {userId};

        setPrivate.apply(invocation, [taskId, false])

        assert.equal(Tasks.findOne({_id: taskId}).private, false);
      })

      it('can set task as checked', () => {
          const setChecked = Meteor.server.method_handlers['tasks.setChecked'];

          const invocation = {userId};

          setChecked.apply(invocation, [taskId, true]);

          assert.equal(Tasks.findOne({_id: taskId}).checked, true);
      })

      it('can set task as unchecked', () => {
        const setChecked = Meteor.server.method_handlers['tasks.setChecked'];

        const invocation = {userId};

        setChecked.apply(invocation, [taskId, false]);

        assert.equal(Tasks.findOne({_id: taskId}).checked, false);
    })
    });
  });
}