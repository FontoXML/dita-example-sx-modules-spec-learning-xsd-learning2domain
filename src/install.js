define([
	'fontoxml-base-flow/addCustomMutation',
	'fontoxml-blueprints/readOnlyBlueprint',
	'fontoxml-documents/documentsManager',
	'fontoxml-operations/addTransform',
	'fontoxml-selectors/evaluateXPathToStrings',

	'./api/insertNodeAndRemoveFromSiblingsCustomMutation',
	'./api/replaceNodesWithMappedStructureCustomMutation'
], function (
	addCustomMutation,
	readOnlyBlueprint,
	documentsManager,
	addTransform,
	evaluateXPathToStrings,

	insertNodeAndRemoveFromSiblings,
	replaceNodesWithMappedStructure
	) {
	'use strict';

	return function install () {
		addCustomMutation('insert-node-and-remove-from-siblings', insertNodeAndRemoveFromSiblings);
		addCustomMutation('replace-nodes-with-mapped-structure', replaceNodesWithMappedStructure);

		addTransform(
			'setSequenceValue',
			function setSequenceValue (stepData) {
				var contextNode = documentsManager.getNodeById(stepData.contextNodeId);
				if (!contextNode || !stepData.sequenceValueXPathQuery) {
					if (!stepData.operationState) {
						stepData.operationState = {};
					}
					stepData.operationState.enabled = false;
					return stepData;
				}

				var sequenceValues = evaluateXPathToStrings(stepData.sequenceValueXPathQuery, contextNode, readOnlyBlueprint);
				stepData.value = String(sequenceValues.length + 1);

				if (sequenceValues.length > 0) {
					for (var i = 1; i <= sequenceValues.length; i++) {
						if (sequenceValues.indexOf(String(i)) === -1) {
							stepData.value = String(i);
							break;
						}
					}
				}

				return stepData;
			}
		);
	};
});
