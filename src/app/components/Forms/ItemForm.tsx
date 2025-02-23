import {
    Box,
    Typography,
    TextField,
    FormControl,
    Button,
    Modal,
    MenuItem,
    Select,
    InputLabel
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useTheme } from "@mui/material/styles";
import style from "./forms.module.css";
import { useDictionary } from "@/app/providers/DictionaryProvider";
import { useProducts } from "@/app/providers/ProductsProvider";
import { ProductInterface, SectionInterface } from "@/app/lib/interfaces";
import { generateId } from "@/app/lib/utils";
import React, { useCallback } from "react";

interface ItemFormProps {
    item?: ProductInterface;
    additionalOnSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
    defaultValue?: string;
    openModal: boolean;
    setOpenModal: (open: boolean) => void;
    onClose?: () => void;
}



export default function ItemForm({ ...props }: ItemFormProps) {
    const {
        defaultValue,
        item,
        openModal,
        setOpenModal,
        additionalOnSubmit,
        onClose
    } = props;

    const isEdit = item !== undefined;
    const theme = useTheme();
    const { dictionary } = useDictionary();
    const [section, setSection] = React.useState<string>(item ? item.section : '');
    const sectionInputRef = React.useRef<HTMLInputElement>(null);
    const { sections, updateProduct, createProduct, createSection } = useProducts();
    console.log('you', item, section);

    const cleanStateAndClose = useCallback(() => {
        setSection('');
        setOpenModal(false);
        if (onClose) onClose();
    }, [onClose, setOpenModal]);

    const onSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const productName = e.currentTarget.productName.value;
        let newSectionId: string = "";

        // if the section is new, create a new section
        if (section === "new_category") {
            newSectionId = generateId();
            const newSection: SectionInterface = {
                id: newSectionId,
                name: e.currentTarget.section.value,
            };
            await createSection(newSection);
        }

        if (isEdit) {
            let dirty = false;
            if (productName !== item.name) {
                item.name = productName;
                dirty = true;
            }
            if (section && section !== item.section) {
                item.section = newSectionId ? newSectionId : section;
                dirty = true;
            }
            if (dirty) {
                await updateProduct(item);
            }
        }
        else {
            const product: ProductInterface = {
                id: generateId(),
                name: String(productName).trim(),
                section: newSectionId ? newSectionId : section,
                quantity: 0,
                created: new Date().toISOString(),
                icon: '',
                image: '',
            };

            await createProduct(product);
        }

        // if additionalOnSubmit is provided, call it
        if (additionalOnSubmit) {
            additionalOnSubmit(e);
        }

        cleanStateAndClose();
    }, [
        isEdit,
        additionalOnSubmit,
        cleanStateAndClose,
        createSection,
        item,
        section,
        updateProduct,
        createProduct
    ]);

    return (
        <Modal
            open={openModal}
            onClose={cleanStateAndClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box
                className={`${style.item_add_form} ${theme.palette.mode}`}
                component="form"
                onSubmit={onSubmit}
            >
                <Typography variant="h5" component="h2" gutterBottom>
                    {isEdit ?
                        dictionary.item_edit_title :
                        dictionary.item_add_title
                    }
                </Typography>
                <TextField
                    fullWidth
                    required
                    id="productName"
                    name="productName"
                    label={dictionary.product_name}
                    variant="outlined"
                    defaultValue={defaultValue ? defaultValue.trim() : item?.name}
                    autoComplete='off'
                    sx={{ mb: 2 }}
                />
                <FormControl
                    fullWidth
                    required
                    sx={{ mb: 2 }}
                >
                    <InputLabel id="section-selector">{dictionary.section_label}</InputLabel>
                    <Select
                        id="section-selector"
                        name="section-selector"
                        label={dictionary.section_label}
                        value={section ? section : item ? item.section : ''}
                        onChange={(e) => {
                            setSection(e.target.value);

                            // focus on the new section input
                            if (e.target.value === "new_category") {
                                setTimeout(() => {
                                    sectionInputRef.current?.focus();
                                }, 10);
                            }
                        }}
                    >
                        {Object.values(sections).map((section) => (
                            <MenuItem key={section.id} value={section.id}>
                                {section.name}
                            </MenuItem>
                        ))}
                        <MenuItem value="new_category">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AddIcon />
                                <span>{dictionary.section_new_title}</span>
                            </Box>
                        </MenuItem>
                    </Select>
                </FormControl>
                {section === 'new_category' && <TextField
                    fullWidth
                    required
                    id="section"
                    name="section"
                    label={dictionary.section_new_label}
                    autoComplete="off"
                    inputRef={sectionInputRef}
                    sx={{ mb: 2 }}
                />
                }
                <Box display="flex" gap={2}>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => cleanStateAndClose()}
                        sx={{ flex: 1 }}
                    >{dictionary.cancel_btn}</Button>

                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        sx={{ flex: 3 }}
                    >{dictionary.save_btn}
                    </Button>
                </Box>
            </Box>
        </Modal>
    )
} 