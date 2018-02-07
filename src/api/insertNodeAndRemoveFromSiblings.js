define([
	'fontoxml-base-flow/CustomMutationResult',
	'fontoxml-blueprints/blueprintQuery',
	'fontoxml-selectors/evaluateXPathToFirstNode',
	'fontoxml-selectors/evaluateXPathToNodes'
], function (
	CustomMutationResult,
	blueprintQuery,
	evaluateXPathToFirstNode,
	evaluateXPathToNodes
	) {
	'use strict';

	/**
	 * Arguments:
	 * @param {NodeId} contextNodeId      The node in which the new node should be inserted.
	 * @param {string} nodeName           The name of the node that needs to be inserted and removed.
	 * @param {string} referenceNodeQuery A Xpath Query to find a node which should become the next
	 *                                      sibling of the new node.
	 */
	return function insertNodeAndRemoveFromSiblings (argument, blueprint) {
		var contextNode = blueprint.lookup(argument.contextNodeId);

		if (!contextNode ||!argument.nodeName || !blueprintQuery.isInDocument(blueprint, contextNode)) {
			return CustomMutationResult.notAllowed();
		}

		var documentNode = blueprintQuery.getDocumentNode(blueprint, contextNode),
			newNode = documentNode.createElement(argument.nodeName),
			referenceNode = argument.referenceNodeQuery ?
				evaluateXPathToFirstNode(argument.referenceNodeQuery, contextNode, blueprint) :
				null;

		blueprint.insertBefore(contextNode, newNode, referenceNode);

		var siblingNodes = evaluateXPathToNodes('preceding-sibling::*', contextNode, blueprint);
		siblingNodes = siblingNodes.concat(
				evaluateXPathToNodes('following-sibling::*', contextNode, blueprint)
			);

		siblingNodes.forEach(function (siblingNode) {
			var removeNode = evaluateXPathToFirstNode(
					'child::' + argument.nodeName,
					siblingNode,
					blueprint
				);

			if (removeNode) {
				blueprint.removeChild(siblingNode, removeNode);
			}
		});

		return CustomMutationResult.ok();
	};
});
