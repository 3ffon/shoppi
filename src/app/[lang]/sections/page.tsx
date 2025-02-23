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
} from '@mui/material';
import {
    DragHandle as DragIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
} from '@mui/icons-material';
import { useDictionary } from '@/app/providers/DictionaryProvider';
import { SectionInterface } from '@/app/lib/interfaces';
import { deleteSection, fetchSections } from '@/app/lib/apiClient';
import SectionForm from '@/app/components/Forms/SectionForm';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

export default function SectionsPage() {
    const { dictionary } = useDictionary();
    const [sections, setSections] = React.useState<SectionInterface[]>([]);
    const [addSectionOpen, setAddSectionOpen] = React.useState(false);
    const [editSection, setEditSection] = React.useState<SectionInterface | undefined>(undefined);

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
        // TODO: Add API call to update section orders
    };

    const handleDeleteSection = async (section: SectionInterface) => {
        await deleteSection(section);
        await fetchSections();
    };

    return (
        <Box sx={{ p: 2, maxWidth: 600, mx: 'auto' }}>
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

            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="sections">
                    {(provided) => (
                        <List {...provided.droppableProps} ref={provided.innerRef}>
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
                                                secondary={`ID: ${section.id}`}
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

            <SectionForm
                section={editSection}
                onSubmit={async () => {
                    await fetchSections();
                    setEditSection(undefined);
                }}
                addSectionOpen={addSectionOpen || !!editSection}
                setAddSectionOpen={(open) => {
                    setAddSectionOpen(open);
                    if (!open) setEditSection(undefined);
                }}
            />
        </Box>
    );
} 