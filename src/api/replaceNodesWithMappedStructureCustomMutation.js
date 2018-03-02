define([
	'fontoxml-stencils/createStencil',
	'fontoxml-blueprints/blueprintQuery',
	'fontoxml-base-flow/CustomMutationResult',
	'fontoxml-selectors/evaluateXPathToFirstNode'
], function (
	createStencil,
	blueprintQuery,
	CustomMutationResult,
	evaluateXPathToFirstNode
	) {
	'use strict';

	/**
	 * Replaces one or more nodes (based on an xpath query starting from the context node) with the structure
	 * that is mapped to that xpath.
	 *
	 * This custom mutation was initially developed to replace <lcAreaShape2> and <lcAreaCoords2> when editing an area
	 * in the lcHotspot2 interaction type. It might also be used by structures inheriting from these DITA classes, such
	 * as the DITA LCE graphic gap match.
	 *
	 * Arguments:
	 * @param {NodeId} contextNodeId                       The node from where to start querying
	 * @param {Object} queryToReplacementStructureMapping
	 */
	return function replaceNodesWithMappedStructure (stepData, blueprint, format, selection) {
		var contextNode = blueprint.lookup(stepData.contextNodeId);
		var documentNode = blueprintQuery.getDocumentNode(blueprint, selection.startContainer);
		if (!contextNode || !blueprintQuery.isInDocument(blueprint, contextNode)) {
			return CustomMutationResult.notAllowed();
		}

		// The operation is only a success if all mappings can be applied.
		var opSuccess = Object.keys(stepData.queryToReplacementStructureMapping)
			.every(function (query) {
				var alignedStencil = createStencil(stepData.queryToReplacementStructureMapping[query])
					.generate(blueprint, format, documentNode);
				if (!alignedStencil) {
					return false;
				}

				var oldNode = evaluateXPathToFirstNode(query, contextNode, blueprint);
				blueprint.replaceChild(blueprint.getParentNode(oldNode), alignedStencil.dom, oldNode);
				return true;
			});

		return opSuccess ? CustomMutationResult.ok() : CustomMutationResult.notAllowed();
	};
});
