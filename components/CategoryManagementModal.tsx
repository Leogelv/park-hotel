"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { typography, spacing, forms } from "@/hooks/useDesignTokens";
import { X, Plus, GripVertical, Pencil, Trash2, Save, XCircle } from "lucide-react";
import { toast } from "sonner";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SpaceType {
  _id: Id<"space_types">;
  name: string;
  slug: string;
  display_name?: string;
  order_index?: number;
  is_active?: boolean;
}

interface CategoryManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Компонент для отображения категории с возможностью перетаскивания
function SortableCategoryItem({ 
  category, 
  onEdit, 
  onDelete,
  isEditing,
  editedCategory,
  onSave,
  onCancel,
  setEditedCategory,
  handleToggleActive
}: {
  category: SpaceType;
  onEdit: (id: Id<"space_types">) => void;
  onDelete: (id: Id<"space_types">) => void;
  isEditing: boolean;
  editedCategory: Partial<SpaceType> | null;
  onSave: () => void;
  onCancel: () => void;
  setEditedCategory: (cat: Partial<SpaceType>) => void;
  handleToggleActive: (id: Id<"space_types">, isActive: boolean) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-2">
      <div className="bg-white rounded-lg border border-beige-200 p-4 shadow-soft">
        <div className="flex items-center gap-3">
          <div {...attributes} {...listeners} className="cursor-grab">
            <GripVertical className="h-5 w-5 text-neutral-400" />
          </div>
          
          <div className="flex-1">
            {isEditing ? (
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={editedCategory?.name || ""}
                  onChange={(e) => setEditedCategory({ ...editedCategory!, name: e.target.value })}
                  placeholder="Название категории"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <input
                  type="text"
                  value={editedCategory?.display_name || ""}
                  onChange={(e) => setEditedCategory({ ...editedCategory!, display_name: e.target.value })}
                  placeholder="Отображаемое название"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <input
                  type="text"
                  value={editedCategory?.slug || ""}
                  onChange={(e) => setEditedCategory({ ...editedCategory!, slug: e.target.value })}
                  placeholder="Slug (латиница)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-neutral-800">{category.name}</span>
                  <span className="text-sm text-neutral-600 ml-2">({category.display_name || category.name})</span>
                  <span className="text-xs text-neutral-500 ml-2">[{category.slug}]</span>
                </div>
                <div className="flex items-center gap-2">
                  <label htmlFor={`active-${category._id}`} className="text-sm text-neutral-700">
                    Активна
                  </label>
                  <input
                    type="checkbox"
                    id={`active-${category._id}`}
                    checked={category.is_active !== false}
                    disabled={isEditing}
                    onChange={(e) => handleToggleActive(category._id, e.target.checked)}
                    className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={onSave}
                  className="h-8 w-8 rounded hover:bg-beige-50 flex items-center justify-center transition-colors"
                  type="button"
                >
                  <Save className="h-4 w-4 text-green-600" />
                </button>
                <button
                  onClick={onCancel}
                  className="h-8 w-8 rounded hover:bg-beige-50 flex items-center justify-center transition-colors"
                  type="button"
                >
                  <XCircle className="h-4 w-4 text-neutral-600" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onEdit(category._id)}
                  className="h-8 w-8 rounded hover:bg-beige-50 flex items-center justify-center transition-colors"
                  type="button"
                >
                  <Pencil className="h-4 w-4 text-neutral-600" />
                </button>
                <button
                  onClick={() => onDelete(category._id)}
                  className="h-8 w-8 rounded hover:bg-red-50 flex items-center justify-center transition-colors text-red-500 hover:text-red-700"
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CategoryManagementModal({ isOpen, onClose }: CategoryManagementModalProps) {
  const categories = useQuery(api.spaceTypes.getAllSpaceTypes, {});
  const createCategory = useMutation(api.spaceTypes.createSpaceType);
  const updateCategory = useMutation(api.spaceTypes.updateSpaceType);
  const updateCategoriesOrder = useMutation(api.spaceTypes.updateSpaceTypesOrder);
  const deleteCategory = useMutation(api.spaceTypes.deleteSpaceType);
  const initializeCategories = useMutation(api.spaceTypes.initializeDefaultCategories);

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<Id<"space_types"> | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: "",
    display_name: "",
    slug: "",
  });
  const [editedCategory, setEditedCategory] = useState<Partial<SpaceType> | null>(null);
  const [localCategories, setLocalCategories] = useState<SpaceType[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    if (categories) {
      setLocalCategories(categories);
    }
  }, [categories]);

  // Инициализация категорий при первом открытии
  useEffect(() => {
    if (isOpen && categories && categories.length === 0) {
      initializeCategories({}).then(() => {
        toast.success("Категории успешно инициализированы");
      });
    }
  }, [isOpen, categories, initializeCategories]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localCategories.findIndex((cat) => cat._id === active.id);
      const newIndex = localCategories.findIndex((cat) => cat._id === over.id);

      const newOrder = arrayMove(localCategories, oldIndex, newIndex);
      setLocalCategories(newOrder);

      // Обновляем order_index для всех измененных категорий
      const updates = newOrder.map((cat, index) => ({
        id: cat._id,
        order_index: index + 1,
      }));

      try {
        await updateCategoriesOrder({ updates });
        toast.success("Порядок категорий обновлен");
      } catch (error) {
        toast.error("Ошибка при обновлении порядка");
        // Восстанавливаем исходный порядок
        if (categories) {
          setLocalCategories(categories);
        }
      }
    }
  };

  const handleCreate = async () => {
    if (!newCategory.name || !newCategory.display_name || !newCategory.slug) {
      toast.error("Заполните все поля");
      return;
    }

    try {
      await createCategory(newCategory);
      toast.success("Категория создана");
      setNewCategory({ name: "", display_name: "", slug: "" });
      setIsCreating(false);
    } catch (error) {
      toast.error("Ошибка при создании категории");
    }
  };

  const handleEdit = (id: Id<"space_types">) => {
    const category = localCategories.find(cat => cat._id === id);
    if (category) {
      setEditingId(id);
      setEditedCategory({
        name: category.name,
        display_name: category.display_name,
        slug: category.slug,
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editedCategory) return;

    try {
      await updateCategory({
        id: editingId,
        ...editedCategory,
      });
      toast.success("Категория обновлена");
      setEditingId(null);
      setEditedCategory(null);
    } catch (error) {
      toast.error("Ошибка при обновлении категории");
    }
  };

  const handleDelete = async (id: Id<"space_types">) => {
    if (!confirm("Вы уверены, что хотите удалить эту категорию?")) return;

    try {
      await deleteCategory({ id });
      toast.success("Категория удалена");
    } catch (error: any) {
      toast.error(error.message || "Ошибка при удалении категории");
    }
  };

  const handleToggleActive = async (id: Id<"space_types">, isActive: boolean) => {
    try {
      await updateCategory({ id, is_active: isActive });
      toast.success(isActive ? "Категория активирована" : "Категория деактивирована");
    } catch (error) {
      toast.error("Ошибка при изменении статуса");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-soft p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className={typography.heading.section}>Управление категориями номеров</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-beige-50 transition-colors"
            type="button"
          >
            <X className="h-5 w-5 text-neutral-600" />
          </button>
        </div>

        <div className="mb-6">
          {isCreating ? (
            <div className="bg-white rounded-lg border border-beige-200 p-4 shadow-soft">
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div>
                  <label htmlFor="name" className={forms.label}>Название категории</label>
                  <input
                    type="text"
                    id="name"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    placeholder="Номера в отеле"
                    className={"w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent " + forms.input}
                  />
                </div>
                <div>
                  <label htmlFor="display_name" className={forms.label}>Отображаемое название</label>
                  <input
                    type="text"
                    id="display_name"
                    value={newCategory.display_name}
                    onChange={(e) => setNewCategory({ ...newCategory, display_name: e.target.value })}
                    placeholder="Номер в отеле"
                    className={"w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent " + forms.input}
                  />
                </div>
                <div>
                  <label htmlFor="slug" className={forms.label}>Slug (латиница)</label>
                  <input
                    type="text"
                    id="slug"
                    value={newCategory.slug}
                    onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                    placeholder="hotel_room"
                    className={"w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent " + forms.input}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleCreate} className="btn-primary" type="button">Создать</button>
                <button onClick={() => {
                  setIsCreating(false);
                  setNewCategory({ name: "", display_name: "", slug: "" });
                }} className="btn-outline" type="button">
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setIsCreating(true)} className="btn-primary flex items-center gap-2" type="button">
              <Plus className="h-4 w-4" />
              Добавить категорию
            </button>
          )}
        </div>

        <div className="space-y-2">
          <p className={typography.body.small + " mb-2"}>
            Перетащите категории для изменения порядка отображения
          </p>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={localCategories.map(cat => cat._id)}
              strategy={verticalListSortingStrategy}
            >
              {localCategories.map((category) => (
                <SortableCategoryItem
                  key={category._id}
                  category={category}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  isEditing={editingId === category._id}
                  editedCategory={editingId === category._id ? editedCategory : null}
                  onSave={handleSaveEdit}
                  onCancel={() => {
                    setEditingId(null);
                    setEditedCategory(null);
                  }}
                  setEditedCategory={setEditedCategory}
                  handleToggleActive={handleToggleActive}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </div>
  );
}