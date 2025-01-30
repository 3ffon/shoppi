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
    Dialog,
    DialogActions,
    DialogTitle,
    Typography,
    IconButton,
    styled,
    Badge,
    badgeClasses,
} from '@mui/material';

import {
    Add as AddIcon,
    Clear as ClearIcon,
    DeleteOutlined as DeleteIcon,
    Tune as TuneIcon,
} from '@mui/icons-material';
import style from './list.module.css';
import Checkbox from '@mui/material/Checkbox';
import { ProductInterface, SectionInterface } from '../../lib/interfaces';
import { fetchDb, updateProduct, createProduct, deleteProduct } from '../../lib/apiClient';
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform, animate } from 'framer-motion';
import { debounce } from 'lodash';
import { useDictionary } from '@/app/[lang]/DictionaryProvider';

async function fetchProducts() {
    const response = await fetchDb();
    return response;
}

const CartBadge = styled(Badge)`
  & .${badgeClasses.badge} {
    top: -12px;
    right: -6px;
  }
`;

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
        isDragging,
        setIsDragging,
    } = props;

    const { dictionary } = useDictionary();
    const [item, setItem] = React.useState(props.item);
    const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
    const [contextMenu, setContextMenu] = React.useState<{
        mouseX: number;
        mouseY: number;
    } | null>(null);
    const [isSwiped, setIsSwiped] = React.useState(false);
    const x = useMotionValue(0); // Track horizontal drag movement
    const buttonOpacity = useTransform(x, [0, 100], [0, 1]); // Button fades inx
    const buttonWidth = useTransform(x, [0, 100], [0, 70]); // Button width expands

    const handleDragEnd = (event: TouchEvent | MouseEvent | PointerEvent, info: PanInfo) => {
        resetSwipeState(info.offset.x > 100);
    };

    useEffect(() => {
        document.addEventListener('click', () => resetSwipeState());
        return () => document.removeEventListener('click', () => resetSwipeState());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSwiped, x]);

    const resetSwipeState = (state = false) => {
        setIsSwiped(state);
        setIsDragging(state);
        animate(x, state ? 100 : 0, { type: "spring", stiffness: 300, damping: 30 });
    };

    const updateItem = async (data: ProductInterface) => {
        setItem(data);
        await updateProduct(data.id, data);
    };

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

    const handleContextMenuClose = () => {
        setContextMenu(null);
    };

    return (
        <Box sx={{ position: 'relative', overflow: 'hidden', width: '100%' }}>
            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 70 }}
                onDragEnd={handleDragEnd}
                dragElastic={0.2}
                dragMomentum={false}
                style={{ x }} // Applies translation to both elements
                onClick={(e) => e.stopPropagation()}
            >
                <ListItem key={`item-${section}-${item.id}`}>
                    <ListItemButton
                        sx={{
                            fontWeight: 'bold',
                            display: "flex",
                            justifyContent: "space-between",
                            transition: 'transform 0.3s ease',
                        }}
                        onContextMenu={handleContextMenu}
                        onClick={(e) => {
                            if (isSwiped || isDragging) {

                                return e.stopPropagation();
                            }
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
                        onClose={handleContextMenuClose}
                        anchorReference="anchorPosition"
                        anchorPosition={
                            contextMenu !== null
                                ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                                : undefined
                        }
                    >
                        <MenuItem onClick={() => {
                            handleContextMenuClose();
                        }}>{dictionary.item_edit_btn}</MenuItem>
                        <MenuItem onClick={async () => {
                            setOpenDeleteDialog(true);
                            handleContextMenuClose();
                        }}>{dictionary.item_delete_btn}</MenuItem>
                    </Menu>
                </ListItem>
            </motion.div>

            <motion.div
                className={style.delete_button_wrapper}
                style={{
                    width: buttonWidth,
                    opacity: buttonOpacity,
                    pointerEvents: isSwiped ? 'auto' : 'none',
                }}
            >
                <Button
                    className={style.delete_button}
                    variant="contained"
                    color="error"
                    onClick={async () => {
                        setOpenDeleteDialog(true);
                    }}
                >
                    <DeleteIcon />
                </Button>
            </motion.div>
            <Dialog
                open={openDeleteDialog}
                onClose={() => {
                    setOpenDeleteDialog(false);
                    resetSwipeState();
                }}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {dictionary.item_delete_dialog} {item.id} ?
                </DialogTitle>
                <DialogActions>
                    <Button onClick={() => {
                        setOpenDeleteDialog(false);
                        resetSwipeState();
                    }}>{dictionary.item_delete_dialog_cancel}</Button>
                    <Button onClick={async () => {
                        await deleteProduct(item.id);
                        await updateItems();
                        setOpenDeleteDialog(false);
                    }} autoFocus>
                        {dictionary.item_delete_dialog_confirm}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>

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
    const [isDragging, setIsDragging] = React.useState(false);
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
            id: String(productId).trim(),
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
            <div className={style.search_wrapper}>
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
                <IconButton className={style.tune_button}>
                    <TuneIcon sx={{ fontSize: 30 }} />
                    <CartBadge badgeContent={2} color="primary" overlap="circular" />
                </IconButton>
            </div>

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
                                isDragging={isDragging}
                                setIsDragging={setIsDragging}
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
                <Box
                    className={`${style.add_item_form} ${theme.palette.mode}`}
                    component="form"
                    onSubmit={handleAddProduct}
                >
                    <Typography variant="h5" component="h2" gutterBottom>
                        {dictionary.add_item_title}
                    </Typography>
                    <TextField
                        fullWidth
                        required
                        id="productId"
                        name="productId"
                        label={dictionary.product_id}
                        variant="outlined"
                        defaultValue={searctInput.trim()}
                        autoComplete='off'
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
                </Box>
            </Modal>
        </div>
    );
}