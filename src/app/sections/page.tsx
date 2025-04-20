"use client";
import React from 'react';
import {
    Box,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from '@mui/material';
import {
    DragHandle as DragIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
} from '@mui/icons-material';
import { useLanguage } from '@/app/providers_tmp/LanguageProvider';
import { SectionInterface } from '@/app/lib/interfaces';
import { deleteSection, fetchSections, updateSection } from '@/app/lib/apiClient';
import SectionForm from '@/app/components/Forms/SectionForm';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import style from './sections.module.css';

export default function SectionsPage() {
    const { dictionary } = useLanguage();
    const [sections, setSections] = React.useState<SectionInterface[]>([]);
    const [addSectionOpen, setAddSectionOpen] = React.useState(false);
    const [editSection, setEditSection] = React.useState<SectionInterface | undefined>(undefined);
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [sectionToDelete, setSectionToDelete] = React.useState<SectionInterface | null>(null);
    const [orderChanged, setOrderChanged] = React.useState(false);

    React.useEffect(() => {
        getSections();
    }, []);

    const getSections = async () => {
        const response = await fetchSections();
        
        // Sort sections by order
        const sortedSections = response ? 
            response.map(sect => {
                if (typeof sect.order !== 'number') {
                    sect.order = 999;
                }
                return sect;
            }).sort((a, b) => (a.order || 0) - (b.order || 0)) 
            : [];
        setSections(sortedSections);
        setOrderChanged(false);
    };

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const items = Array.from(sections);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // Update order property for all items
        const updatedItems = items.map((item, index) => ({
            ...item,
            order: index
        }));

        setSections(updatedItems);
        setOrderChanged(true);
    };

    const handleDeleteSection = (section: SectionInterface) => {
        setSectionToDelete(section);
        setDeleteDialogOpen(true);
    };

    const confirmDeleteSection = async () => {
        if (sectionToDelete) {
            await deleteSection(sectionToDelete);
            await getSections();
            setDeleteDialogOpen(false);
            setSectionToDelete(null);
        }
    };

    const saveOrderChanges = async () => {
        // Update all sections with their new order
        for (const section of sections) {
            await updateSection(section);
        }
        setOrderChanged(false);
        await getSections();
    };

    return (
        <div className={style.component_wrapper}>
            <Box sx={{ p: 2, width: '100%', maxWidth: 600, mx: 'auto' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5">{dictionary.section_management}</Typography>
                    <Button 
                        variant="contained" 
                        startIcon={<AddIcon />}
                        onClick={() => setAddSectionOpen(true)}
                    >
                        {dictionary.section_new_title}
                    </Button>
                </Box>

                {orderChanged && (
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button 
                            variant="contained" 
                            color="primary"
                            onClick={saveOrderChanges}
                        >
                            {dictionary.save_order || "Save Order"}
                        </Button>
                    </Box>
                )}
            </Box>

            <div className={style.list_wrapper}>
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="sections">
                        {(provided) => (
                            <List 
                                {...provided.droppableProps} 
                                ref={provided.innerRef}
                                className={style.list}
                            >
                                {sections.map((section, index) => (
                                    <Draggable 
                                        key={section.id} 
                                        draggableId={section.id} 
                                        index={index}
                                    >
                                        {(provided) => (
                                            <ListItem
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                secondaryAction={
                                                    <Box>
                                                        <IconButton 
                                                            edge="end" 
                                                            onClick={() => setEditSection(section)}
                                                        >
                                                            <EditIcon />
                                                        </IconButton>
                                                        <IconButton 
                                                            edge="end"
                                                            onClick={() => handleDeleteSection(section)}
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Box>
                                                }
                                            >
                                                <div {...provided.dragHandleProps}>
                                                    <DragIcon sx={{ mr: 2 }} />
                                                </div>
                                                <ListItemText 
                                                    primary={section.name}
                                                    secondary={`ID: ${section.id} | Order: ${section.order}`}
                                                />
                                            </ListItem>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </List>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>

            <SectionForm
                section={editSection}
                onSubmit={async () => {
                    await getSections();
                    setEditSection(undefined);
                }}
                addSectionOpen={addSectionOpen || !!editSection}
                setAddSectionOpen={(open) => {
                    setAddSectionOpen(open);
                    if (!open) setEditSection(undefined);
                }}
            />

            {/* Delete confirmation dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>{dictionary.delete_section_title || "Delete Section"}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {dictionary.delete_section_confirmation || "Are you sure you want to delete this section? This will also remove all products in this section."}
                    </DialogContentText>
                    {sectionToDelete && (
                        <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold' }}>
                            {sectionToDelete.name}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
                        {dictionary.cancel_btn}
                    </Button>
                    <Button onClick={confirmDeleteSection} color="error" variant="contained">
                        {dictionary.delete_btn || "Delete"}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}