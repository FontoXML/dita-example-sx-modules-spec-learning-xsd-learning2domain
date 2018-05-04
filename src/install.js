define([
	'fontoxml-base-flow/addCustomMutation',
	'fontoxml-blueprints/readOnlyBlueprint',
	'fontoxml-documents/documentsManager',
	'fontoxml-dom-identification/getNodeId',
	'fontoxml-operations/addTransform',
	'fontoxml-selection/selectionManager',
	'fontoxml-selectors/evaluateXPathToFirstNode',
	'fontoxml-selectors/evaluateXPathToStrings',

	'./api/insertNodeAndRemoveFromSiblingsCustomMutation',
	'./api/replaceNodesWithMappedStructureCustomMutation'
], function (
	addCustomMutation,
	readOnlyBlueprint,
	documentsManager,
	getNodeId,
	addTransform,
	selectionManager,
	evaluateXPathToFirstNode,
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

		addTransform(
			'disableOperationIfContextNode',
			function (stepData) {
				return stepData;
			},
			function disableOperationIfContextNode (stepData) {
				var contextNode = documentsManager.getNodeById(stepData.contextNodeId);
				if (contextNode) {
					stepData.operationState = {
						enabled: false
					};
				}
				return stepData;
			}
		);

		addTransform(
			'setContextNodeIdToPrecedinglcInteraction',
			function setContextNodeIdToPrecedinglcInteraction (stepData) {
				var selectedElement = selectionManager.getSelectedElement();
				if (!selectedElement) {
					return stepData;
				}

				var lcInteractionNode;
				var selectionAncestor = evaluateXPathToFirstNode('ancestor-or-self::*[self::section or self::lcSummary]', selectedElement, readOnlyBlueprint);
				if (selectionAncestor) {
					lcInteractionNode = evaluateXPathToFirstNode('preceding-sibling::lcInteraction[1]', selectionAncestor, readOnlyBlueprint);
				}
				else {
					lcInteractionNode = evaluateXPathToFirstNode('self::learningAssessmentbody/child::lcInteraction[last()]', selectedElement, readOnlyBlueprint);
				}

				if (lcInteractionNode) {
					stepData.contextNodeId = getNodeId(lcInteractionNode);
				}

				return stepData;
			}
		);
	};
});
