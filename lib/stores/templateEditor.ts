import { create } from 'zustand';

interface Template {
  id: string;
  name: string;
  content?: string;
  createdAt?: string;
}

interface Variable {
  name: string;
  defaultValue: string;
  order?: number;
}

interface TemplateAsset {
  id: string;
  name: string;
  url: string;
  type: string;
}

interface EditorState {
  template: Partial<Template> | null;
  assets: TemplateAsset[];
  isDirty: boolean;
  isLoading: boolean;
  selectedVariable: Variable | null;
  variables: Variable[];
  setTemplate: (template: Partial<Template> | null) => void;
  updateTemplate: (updates: Partial<Template>) => void;
  addAsset: (asset: TemplateAsset) => void;
  removeAsset: (assetId: string) => void;
  setIsDirty: (isDirty: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setSelectedVariable: (variable: Variable | null) => void;
  addVariable: (variable: Variable) => void;
  removeVariable: (name: string) => void;
  reset: () => void;
}

const initialState = {
  template: null,
  assets: [],
  isDirty: false,
  isLoading: false,
  selectedVariable: null,
  variables: [],
};

export const useTemplateEditor = create<EditorState>((set) => ({
  ...initialState,

  setTemplate: (template) => set({ template, isDirty: false }),
  
  updateTemplate: (updates) =>
    set((state) => ({
      template: state.template ? { ...state.template, ...updates } : updates,
      isDirty: true,
    })),

  addAsset: (asset) =>
    set((state) => ({
      assets: [...state.assets, asset],
      isDirty: true,
    })),

  removeAsset: (assetId) =>
    set((state) => ({
      assets: state.assets.filter((a) => a.id !== assetId),
      isDirty: true,
    })),

  setIsDirty: (isDirty) => set({ isDirty }),
  
  setIsLoading: (isLoading) => set({ isLoading }),
  
  setSelectedVariable: (variable) => set({ selectedVariable: variable }),
  
  addVariable: (variable) =>
    set((state) => {
      const existingIndex = state.variables.findIndex((v) => v.name === variable.name);
      if (existingIndex !== -1) {
        const newVariables = [...state.variables];
        newVariables[existingIndex] = variable;
        return { variables: newVariables };
      }
      return {
        variables: [...state.variables, { ...variable, order: state.variables.length }],
      };
    }),

  removeVariable: (name) =>
    set((state) => ({
      variables: state.variables.filter((v) => v.name !== name),
      selectedVariable: state.selectedVariable?.name === name ? null : state.selectedVariable,
    })),

  reset: () => set(initialState),
})); 