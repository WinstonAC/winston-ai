import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useTemplateEditor } from '@/hooks/useTemplateEditor';

export function TemplateVariables() {
  const {
    variables,
    selectedVariable,
    setSelectedVariable,
    addVariable,
    removeVariable,
    reorderVariables,
    updateVariableDefaultValue,
  } = useTemplateEditor();

  const [newVariableName, setNewVariableName] = useState('');

  const handleAddVariable = (e: React.FormEvent) => {
    e.preventDefault();
    addVariable(newVariableName);
    setNewVariableName('');
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    reorderVariables(result.source.index, result.destination.index);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Template Variables</h2>
      
      {/* Add new variable form */}
      <form onSubmit={handleAddVariable} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newVariableName}
            onChange={(e) => setNewVariableName(e.target.value)}
            placeholder="Variable name"
            className="flex-1 px-3 py-2 border rounded"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add
          </button>
        </div>
      </form>

      {/* Variables list */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="variables">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {variables.map((variable, index) => (
                <Draggable
                  key={variable.name}
                  draggableId={variable.name}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`p-3 border rounded ${
                        selectedVariable?.name === variable.name
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200'
                      }`}
                      onClick={() => setSelectedVariable(variable)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{variable.name}</div>
                          <input
                            type="text"
                            value={variable.defaultValue}
                            onChange={(e) =>
                              updateVariableDefaultValue(
                                variable.name,
                                e.target.value
                              )
                            }
                            placeholder="Default value"
                            className="mt-1 px-2 py-1 text-sm border rounded"
                          />
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeVariable(variable.name);
                          }}
                          className="p-1 text-red-500 hover:text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
} 