import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided } from 'react-beautiful-dnd';
import { useTemplateEditor } from '@/lib/stores/templateEditor';
import { Plus, X, GripVertical } from 'lucide-react';

interface Variable {
  name: string;
  defaultValue: string;
  order?: number;
}

export default function VariablesSidebar() {
  const {
    variables,
    selectedVariable,
    setSelectedVariable,
    addVariable,
    removeVariable,
  } = useTemplateEditor();

  const handleAddVariable = () => {
    const name = window.prompt('Enter variable name:');
    if (name) {
      addVariable({ name, defaultValue: '' });
    }
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(variables);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    items.forEach((item, index) => {
      addVariable({ ...item, order: index });
    });
  };

  return (
    <div className="w-64 border-l-4 border-white bg-black text-white">
      <div className="p-4 border-b-4 border-white">
        <h3 className="text-xl font-bold mb-4">VARIABLES</h3>
        <button
          onClick={handleAddVariable}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white text-black border-4 border-white hover:bg-black hover:text-white transition-colors font-bold"
        >
          <Plus size={20} />
          ADD VARIABLE
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="variables">
          {(provided: DroppableProvided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="p-4 space-y-4"
            >
              {variables.map((variable: Variable, index: number) => (
                <Draggable
                  key={variable.name}
                  draggableId={variable.name}
                  index={index}
                >
                  {(provided: DraggableProvided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`p-4 border-4 ${
                        selectedVariable?.name === variable.name
                          ? 'border-white bg-white text-black'
                          : 'border-white hover:bg-white hover:text-black'
                      } transition-colors`}
                      onClick={() => setSelectedVariable(variable)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            {...provided.dragHandleProps}
                            className="cursor-grab"
                          >
                            <GripVertical size={20} />
                          </div>
                          <span className="font-bold">{variable.name}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeVariable(variable.name);
                          }}
                          className="hover:text-red-500 transition-colors"
                        >
                          <X size={20} />
                        </button>
                      </div>
                      {selectedVariable?.name === variable.name && (
                        <div className="mt-4">
                          <input
                            type="text"
                            value={variable.defaultValue}
                            onChange={(e) =>
                              addVariable({
                                ...variable,
                                defaultValue: e.target.value,
                              })
                            }
                            placeholder="DEFAULT VALUE"
                            className="w-full p-3 text-sm bg-black text-white border-4 border-white focus:outline-none focus:bg-white focus:text-black transition-colors"
                          />
                        </div>
                      )}
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