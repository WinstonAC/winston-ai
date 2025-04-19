import { useCallback } from 'react';
import { useTemplateEditor as useStore } from '@/lib/stores/templateEditor';

export function useTemplateEditor() {
  const store = useStore();

  const reorderVariables = useCallback((startIndex: number, endIndex: number) => {
    const variables = [...store.variables];
    const [removed] = variables.splice(startIndex, 1);
    variables.splice(endIndex, 0, removed);

    // Update order for all variables
    const updatedVariables = variables.map((variable, index) => ({
      ...variable,
      order: index,
    }));

    store.setVariables(updatedVariables);
  }, [store]);

  const addVariable = useCallback((name: string) => {
    if (!name.trim()) return;
    
    store.addVariable({
      name: name.trim(),
      defaultValue: '',
      order: store.variables.length,
    });
  }, [store]);

  const updateVariableDefaultValue = useCallback((name: string, defaultValue: string) => {
    const variable = store.variables.find(v => v.name === name);
    if (variable) {
      store.addVariable({
        ...variable,
        defaultValue,
      });
    }
  }, [store]);

  return {
    variables: store.variables,
    selectedVariable: store.selectedVariable,
    setSelectedVariable: store.setSelectedVariable,
    addVariable,
    removeVariable: store.removeVariable,
    reorderVariables,
    updateVariableDefaultValue,
  };
} 