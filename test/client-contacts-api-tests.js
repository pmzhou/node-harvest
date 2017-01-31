'use strict';

const assert = require('assert');
const common = require('./common');

const harvest = common.harvest;

describe('The ClientContacts API', function() {
  describe('Get all client contacts for an account', function() {
    it('should implement the list method', function() {
      assert.equal(typeof harvest.clientContacts.list, 'function');
    });
  });
  describe('Get all client contacts for a client', function() {
    it('should implement the listByClient method', function() {
      assert.equal(typeof harvest.clientContacts.listByClient, 'function');
    });
  });
  describe('Get a client contact', function() {
    it('should implement the get method', function() {
      assert.equal(typeof harvest.clientContacts.get, 'function');
    });
  });
  describe('Create a new client contact', function() {
    it('should implement the create method', function() {
      assert.equal(typeof harvest.clientContacts.create, 'function');
    });
  });
  describe('Update client contact', function() {
    it('should implement the update method', function() {
      assert.equal(typeof harvest.clientContacts.update, 'function');
    });
  });
  describe('Delete a client contact', function() {
    it('should implement the delete method', function() {
      assert.equal(typeof harvest.clientContacts.delete, 'function');
    });
  });
});
