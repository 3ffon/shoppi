"use client"
import React, { useEffect, useCallback } from 'react'
import {
    Box,
    Button,
    FormControl,
    InputAdornment,
    InputLabel,
    List,
    ListItem,
    ListItemButton,
    MenuItem,
    Modal,
    Select,
    TextField,
    Menu,
    useTheme,
} from '@mui/material';

import {
    Add as AddIcon,
    Clear as ClearIcon,
} from '@mui/icons-material';
import style from './list.module.css';
import Checkbox from '@mui/material/Checkbox';
import { ProductInterface, SectionInterface } from '../../lib/interfaces';
import { fetchDb, updateProduct, createProduct, deleteProduct } from '../../lib/apiClient';
import { motion, AnimatePresence } from 'framer-motion';
import { debounce } from 'lodash';
import { useDictionary } from '@/app/[lang]/DictionaryProvider';

async function fetchProducts() {
    const response = await fetchDb();
    return response;
}

function AddItem({ ...props }) {
    const {
        show,
        addItem,
    } = props;

    const { dictionary } = useDictionary();

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className={style.add_item}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                >
                    <Button
                        onClick={addItem}
                        variant="contained"
                        color="primary"
                    >
                        {dictionary.add_item} <AddIcon />
                    </Button>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

function Item({ ...props }) {
    const {
        section,
        updateItems,
    } = props;

    const { dictionary } = useDictionary();
    const [item, setItem] = React.useState(props.item);
    const [contextMenu, setContextMenu] = React.useState<{
        mouseX: number;
        mouseY: number;
    } | null>(null);
    const [longPressTimer, setLongPressTimer] = React.useState<NodeJS.Timeout | null>(null);

    const updateItem = async (data: ProductInterface) => {
        setItem(data);
        await updateProduct(data.id, data);
    }

    const handleContextMenu = (event: React.MouseEvent) => {
        event.preventDefault();
        setContextMenu(
            contextMenu === null
                ? {
                    mouseX: event.clientX + 2,
                    mouseY: event.clientY - 6,
                }
                : null,
        );
    };

    const handleTouchStart = (event: React.TouchEvent) => {
        const timer = setTimeout(() => {
            // Open context menu at touch position
            setContextMenu({
                mouseX: event.touches[0].clientX - 10,
                mouseY: event.touches[0].clientY - 10,
            });
        }, 500); // 500ms long press
        setLongPressTimer(timer);
    };

    const handleTouchEnd = () => {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            setLongPressTimer(null);
        }
    };

    const handleClose = () => {
        setContextMenu(null);
    };

    return (
        <ListItem key={`item-${section}-${item.id}`} dense>
            <ListItemButton
                sx={{
                    fontWeight: 'bold',
                    display: "flex",
                    justifyContent: "space-between",
                }}
                onContextMenu={handleContextMenu}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchEnd} // Cancel long press if user moves finger
                onClick={() => {
                    const updatedItem = {
                        ...item,
                        quantity: item.quantity > 0 ? 0 : 1
                    };
                    updateItem(updatedItem);
                }}
            >
                <div style={{ display: 'grid' }}>
                    {item.id}
                    <small>{section.name}</small>
                </div>
                <Checkbox
                    sx={{
                        pointerEvents: "none",
                    }}
                    checked={item.quantity > 0}
                />
            </ListItemButton>
            <Menu
                open={contextMenu !== null}
                onClose={handleClose}
                anchorReference="anchorPosition"
                anchorPosition={
                    contextMenu !== null
                        ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                        : undefined
                }
            >
                <MenuItem onClick={() => {
                    handleClose();
                }}>{dictionary.item_edit_btn}</MenuItem>
                <MenuItem onClick={async () => {
                    handleClose();
                    await deleteProduct(item.id);
                    await updateItems();
                }}>{dictionary.item_delete_btn}</MenuItem>
            </Menu>
        </ListItem>
    );
}

export default function Items({ }) {
    const theme = useTheme();
    const { dictionary } = useDictionary();
    const [items, setItems] = React.useState<ProductInterface[]>([]);
    const [sections, setSections] = React.useState<{ [key: string]: SectionInterface }>({});
    const [searctInput, setSearchInput] = React.useState('');
    const [search, setSearch] = React.useState('');
    const [addItemOpen, setAddItemOpen] = React.useState(false);
    const filteredProducts = items?.filter((product: ProductInterface) =>
        product.id.toLowerCase().includes(search.toLowerCase())
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedSetSearch = useCallback(debounce(setSearch, 150), []);

    useEffect(() => {
        return () => {
            debouncedSetSearch.cancel();
        }
    }, [debouncedSetSearch]);

    useEffect(() => {
        fetchProducts().then(response => {
            setItems(response.items);
            setSections(response.sections);
        });
    }, []);

    const addItem = () => {
        setAddItemOpen(true);
    };

    const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
        console.log(e.currentTarget);
        e.preventDefault();

        const productId = e.currentTarget.productId.value;
        const sectionId = e.currentTarget.section.value;

        const product: ProductInterface = {
            id: productId,
            section: sectionId,
            quantity: 0,
            created: new Date().toISOString(),
            icon: '',
            image: '',
        }
        await createProduct(product);
        await updateItems();
        setAddItemOpen(false);
        setSearchInput('');
        setSearch('');
    };

    const updateItems = async () => {
        const response = await fetchProducts();
        setItems(response.items);
        setSections(response.sections);
    };

    return (
        <div className={style.list_wrapper}>
            <TextField
                id="item-search"
                label={dictionary.search_input}
                variant="outlined"
                className={style.search}
                value={searctInput}
                autoComplete='off'
                slotProps={{
                    input: {
                        endAdornment: search.length > 0 && <InputAdornment position="end"><ClearIcon onClick={() => {
                            setSearch('')
                            setSearchInput('')
                        }} /></InputAdornment>,
                    },
                }}
                onChange={e => {
                    setSearchInput(e.target.value);
                    debouncedSetSearch(e.target.value);
                }}
            />

            <AddItem show={search.length > 0} addItem={addItem} />

            <List
                className={style.list}
                subheader={<li />}
            >
                <AnimatePresence>
                    {filteredProducts?.map((item) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Item
                                key={item.id}
                                item={item}
                                section={sections[item.section]}
                                updateItems={updateItems}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </List>
            <Modal
                open={addItemOpen}
                onClose={() => setAddItemOpen(false)}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box className={`${style.add_item_form} ${theme.palette.mode}`}>
                    <form onSubmit={handleAddProduct}>
                        <TextField
                            fullWidth
                            required
                            id="productId"
                            name="productId"
                            label={dictionary.product_id}
                            variant="outlined"
                            value={searctInput}

                            sx={{ mb: 2 }}
                        />
                        <FormControl
                            fullWidth
                            sx={{ mb: 2 }}
                            required
                        >
                            <InputLabel id="section-label">{dictionary.section}</InputLabel>
                            <Select
                                labelId="section-label"
                                id="section"
                                name="section"
                                label={dictionary.section}
                                defaultValue="veggies"
                            >
                                {Object.entries(sections).map(([id, section]) => (
                                    <MenuItem key={id} value={id}>{section.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            color="primary"
                        >
                            {dictionary.save}
                        </Button>

                    </form>
                </Box>
            </Modal>
        </div>
    );
}