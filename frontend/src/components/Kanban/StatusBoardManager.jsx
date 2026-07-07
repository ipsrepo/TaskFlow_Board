import {useMemo, useState} from 'react';
import {
    DndContext,
    KeyboardSensor,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    SortableContext,
    arrayMove,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import useStatusBoard from '../../hooks/useStatusBoard.js';
import Alert from '../UI/Alert.jsx';
import Button from '../UI/Button.jsx';
import Icon from '../UI/Icon.jsx';
import Input from '../UI/Input.jsx';
import Modal from '../UI/Modal.jsx';

const colorPresets = ['#6D45E8', '#2E90FA', '#12B76A', '#F79009', '#EF476F', '#7F56D9', '#06B6D4', '#667085'];

const getBoards = (response) => response?.statusBoards || response?.data?.statusBoards || [];
const boardId = (board) => `status-board:${board._id || board.name}`;

const SortableBoardRow = ({board, isEditing, editValues, onEdit, onCancel, onChange, onSave, onDelete, isSaving}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({id: boardId(board)});
    const style = {transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.55 : 1};

    return (
        <div ref={setNodeRef} style={style}
             className="flex items-center gap-3 rounded-xl border border-line bg-white px-3 py-2.5 shadow-sm">
            <button ref={setActivatorNodeRef} type="button"
                    className="icon-button-sm cursor-grab active:cursor-grabbing"
                    aria-label={`Reorder ${board.name}`} {...attributes} {...listeners}>
                <Icon name="handle" size={17}/>
            </button>

            {isEditing ? (
                <>
                    <input type="color" value={editValues.color || board.color}
                           onChange={(event) => onChange('color', event.target.value)}
                           className="h-8 w-8 cursor-pointer rounded-lg border border-line bg-white p-0.5"
                           aria-label="Board color"/>
                    <input value={editValues.name} onChange={(event) => onChange('name', event.target.value)}
                           disabled={board.isDefault} className="input-base h-9 flex-1 py-1.5" aria-label="Board name"/>
                    <Button loading={isSaving} onClick={() => onSave(board)}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={onCancel} aria-label="Cancel editing"><Icon name="x"
                                                                                                           size={16}/></Button>
                </>
            ) : (
                <>
                    <span className="h-3 w-3 shrink-0 rounded-full" style={{backgroundColor: board.color}}/>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-secondary">{board.name}</span>
                    {board.isDefault && <span
                        className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">Default</span>}
                    <button type="button" onClick={() => onEdit(board)}
                            className="rounded-lg px-2 py-1 text-xs font-semibold text-primary-700 transition-colors hover:bg-primary-50">Edit
                    </button>
                    {!board.isDefault && <button type="button" onClick={() => onDelete(board)}
                                                 className="rounded-lg px-2 py-1 text-xs font-semibold text-danger transition-colors hover:bg-red-50">Delete</button>}
                </>
            )}
        </div>
    );
};

const StatusBoardManager = ({project, onClose, onUpdate}) => {
    const {createStatusBoard, updateStatusBoard, deleteStatusBoard} = useStatusBoard();
    const initialBoards = useMemo(() => [...(project.statusBoards || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)), [project.statusBoards]);
    const [boards, setBoards] = useState(initialBoards);
    const [newBoard, setNewBoard] = useState({name: '', color: colorPresets[0]});
    const [editingBoardName, setEditingBoardName] = useState(null);
    const [editValues, setEditValues] = useState({name: '', color: ''});
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {activationConstraint: {distance: 6}}),
        useSensor(KeyboardSensor, {coordinateGetter: sortableKeyboardCoordinates}),
    );

    const synchronizeBoards = (nextBoards) => {
        const sortedBoards = [...nextBoards].sort((first, second) => (first.order ?? 0) - (second.order ?? 0));
        setBoards(sortedBoards);
        onUpdate(sortedBoards);
    };

    const startEditing = (board) => {
        setEditingBoardName(board.name);
        setEditValues({name: board.name, color: board.color});
    };

    const addBoard = async () => {
        const name = newBoard.name.trim();
        if (!name) {
            setError('Enter a board name before adding it.');
            return;
        }
        if (boards.some((board) => board.name.toLowerCase() === name.toLowerCase())) {
            setError('A board with this name already exists.');
            return;
        }

        const previousBoards = boards;
        const temporaryBoard = {
            _id: `temporary-${Date.now()}`,
            name,
            color: newBoard.color,
            order: boards.length,
            isDefault: false
        };
        synchronizeBoards([...boards, temporaryBoard]);
        setNewBoard({name: '', color: colorPresets[0]});
        setError('');
        setIsSaving(true);

        const response = await createStatusBoard(project._id, {name, color: temporaryBoard.color});
        if (response?.success) {
            synchronizeBoards(getBoards(response));
        } else {
            synchronizeBoards(previousBoards);
            setError(response?.message || 'Unable to add the board.');
        }
        setIsSaving(false);
    };

    const saveBoard = async (board) => {
        const name = editValues.name.trim();
        if (!name) {
            setError('Board name cannot be empty.');
            return;
        }
        if (!board.isDefault && boards.some((item) => item.name.toLowerCase() === name.toLowerCase() && item.name !== board.name)) {
            setError('A board with this name already exists.');
            return;
        }

        const previousBoards = boards;
        const optimisticBoards = boards.map((item) => item.name === board.name ? {
            ...item,
            name: board.isDefault ? item.name : name,
            color: editValues.color || item.color
        } : item);
        synchronizeBoards(optimisticBoards);
        setEditingBoardName(null);
        setError('');
        setIsSaving(true);

        const response = await updateStatusBoard(project._id, board.name, {
            name: board.isDefault ? board.name : name,
            color: editValues.color
        });
        if (response?.success) {
            synchronizeBoards(getBoards(response));
        } else {
            synchronizeBoards(previousBoards);
            setError(response?.message || 'Unable to save the board.');
        }
        setIsSaving(false);
    };

    const removeBoard = async (board) => {
        const confirmed = window.confirm(`Delete "${board.name}"? Tasks in this status will no longer appear in the board until they are reassigned.`);
        if (!confirmed) return;

        const previousBoards = boards;
        synchronizeBoards(boards.filter((item) => item.name !== board.name));
        setError('');
        setIsSaving(true);

        const response = await deleteStatusBoard(project._id, board.name);
        if (response?.success) {
            synchronizeBoards(getBoards(response));
        } else {
            synchronizeBoards(previousBoards);
            setError(response?.message || 'Unable to delete the board.');
        }
        setIsSaving(false);
    };

    const reorderBoards = async ({active, over}) => {
        if (!over || active.id === over.id) return;

        const oldIndex = boards.findIndex((board) => boardId(board) === active.id);
        const newIndex = boards.findIndex((board) => boardId(board) === over.id);
        if (oldIndex < 0 || newIndex < 0) return;

        const previousBoards = boards;
        const reorderedBoards = arrayMove(boards, oldIndex, newIndex).map((board, index) => ({...board, order: index}));
        synchronizeBoards(reorderedBoards);
        setError('');

        const results = await Promise.all(reorderedBoards.map((board) => updateStatusBoard(project._id, board.name, {order: board.order})));
        if (results.every((result) => result?.success)) return;

        synchronizeBoards(previousBoards);
        setError('Unable to save the board order.');
    };

    return (
        <Modal isOpen onClose={onClose} title="Manage status boards"
               subtitle="Add, rename, color, or reorder the workflow stages." size="lg">
            <div className="space-y-6 p-5 sm:p-6">
                {error && <Alert type="error" message={error} onClose={() => setError('')}/>}

                <section>
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="section-title">Workflow stages</h3>
                        <span className="text-xs text-muted">Drag the handle to reorder</span>
                    </div>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={reorderBoards}>
                        <SortableContext items={boards.map(boardId)} strategy={verticalListSortingStrategy}>
                            <div className="space-y-2">
                                {boards.map((board) => (
                                    <SortableBoardRow
                                        key={board._id || board.name}
                                        board={board}
                                        isEditing={editingBoardName === board.name}
                                        editValues={editValues}
                                        onEdit={startEditing}
                                        onCancel={() => setEditingBoardName(null)}
                                        onChange={(field, value) => setEditValues((current) => ({
                                            ...current,
                                            [field]: value
                                        }))}
                                        onSave={saveBoard}
                                        onDelete={removeBoard}
                                        isSaving={isSaving}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </section>

                <section className="border-t border-line pt-5">
                    <h3 className="section-title">Add a board</h3>
                    <p className="mt-1 text-sm text-muted">New boards appear in the board immediately after you add
                        them.</p>
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                        <Input label="Board name" value={newBoard.name}
                               onChange={(event) => setNewBoard((current) => ({...current, name: event.target.value}))}
                               placeholder="For example, QA review" className="flex-1"/>
                        <label className="block">
                            <span className="field-label">Color</span>
                            <input type="color" value={newBoard.color} onChange={(event) => setNewBoard((current) => ({
                                ...current,
                                color: event.target.value
                            }))}
                                   className="h-10 w-full cursor-pointer rounded-xl border border-line bg-white p-1 sm:w-14"
                                   aria-label="New board color"/>
                        </label>
                        <Button loading={isSaving} onClick={addBoard} icon={<Icon name="plus" size={17}/>}>Add
                            board</Button>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {colorPresets.map((color) => (
                            <button key={color} type="button"
                                    onClick={() => setNewBoard((current) => ({...current, color}))}
                                    className={`h-6 w-6 rounded-full ring-offset-2 transition-transform hover:scale-110 ${newBoard.color === color ? 'ring-2 ring-secondary' : ''}`}
                                    style={{backgroundColor: color}} aria-label={`Use color ${color}`}/>
                        ))}
                    </div>
                </section>

                <div className="flex justify-end border-t border-line pt-5"><Button variant="outline"
                                                                                    onClick={onClose}>Done</Button>
                </div>
            </div>
        </Modal>
    );
};

export default StatusBoardManager;
