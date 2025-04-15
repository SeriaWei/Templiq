import { validateSchema } from '../pack';

// @ts-ignore
import { describe, expect, test } from '@jest/globals';

describe('validateSchema', () => {
    test('should validate a valid schema without data', () => {
        const schema = {
            title: {
                FieldType: 'SingleLine',
                DisplayName: 'Title'
            }
        };
        expect(() => validateSchema(schema, true)).not.toThrow();
    });

    test('should validate a valid schema with data', () => {
        const schema = {
            title: {
                FieldType: 'SingleLine',
                DisplayName: 'Title'
            }
        };
        const data = {
            title: 'Test Title'
        };
        expect(() => validateSchema(schema, true, data)).not.toThrow();
    });

    test('should throw error for reserved field name', () => {
        const schema = {
            Properties: {
                FieldType: 'SingleLine',
                DisplayName: 'Properties'
            }
        };
        expect(() => validateSchema(schema, true))
            .toThrow('Detected reserved field name \'Properties\', to avoid system conflicts, the packaging process has been terminated. Please modify the field name and retry.');
    });

    test('should throw error for missing FieldType', () => {
        const schema = {
            title: {
                DisplayName: 'Title'
            }
        };
        expect(() => validateSchema(schema, true))
            .toThrow('Field \'title\' is missing required property \'FieldType\'.');
    });

    test('should throw error for missing DisplayName', () => {
        const schema = {
            title: {
                FieldType: 'SingleLine'
            }
        };
        expect(() => validateSchema(schema, true))
            .toThrow('Field \'title\' is missing required property \'DisplayName\'.');
    });

    test('should throw error for invalid FieldType', () => {
        const schema = {
            title: {
                FieldType: 'InvalidType',
                DisplayName: 'Title'
            }
        };
        expect(() => validateSchema(schema, true))
            .toThrow(/Invalid FieldType 'InvalidType' for field 'title'/);
    });

    test('should validate Radio field with valid options', () => {
        const schema = {
            choice: {
                FieldType: 'Radio',
                DisplayName: 'Choice',
                FieldOptions: [
                    { DisplayText: 'Option 1', Value: '1' },
                    { DisplayText: 'Option 2', Value: '2' }
                ]
            }
        };
        expect(() => validateSchema(schema, true)).not.toThrow();
    });

    test('should throw error for Radio field without options', () => {
        const schema = {
            choice: {
                FieldType: 'Radio',
                DisplayName: 'Choice'
            }
        };
        expect(() => validateSchema(schema, true))
            .toThrow('Field \'choice\' is missing required property \'FieldOptions\'.');
    });

    test('should validate Dropdown field with valid options', () => {
        const schema = {
            choice: {
                FieldType: 'Dropdown',
                DisplayName: 'Choice',
                FieldOptions: [
                    { DisplayText: 'Option 1', Value: '1' },
                    { DisplayText: 'Option 2', Value: '2' }
                ]
            }
        };
        expect(() => validateSchema(schema, true)).not.toThrow();
    });

    test('should throw error for empty FieldOptions array', () => {
        const schema = {
            choice: {
                FieldType: 'Radio',
                DisplayName: 'Choice',
                FieldOptions: []
            }
        };
        expect(() => validateSchema(schema, true))
            .toThrow('FieldOptions for field \'choice\' should more than 1.');
    });

    test('should validate nested Array fields', () => {
        const schema = {
            sections: {
                FieldType: 'Array',
                DisplayName: 'Sections',
                Children: [{
                    title: {
                        FieldType: 'SingleLine',
                        DisplayName: 'Title'
                    },
                    items: {
                        FieldType: 'Array',
                        DisplayName: 'Items',
                        Children: [{
                            name: {
                                FieldType: 'SingleLine',
                                DisplayName: 'Name'
                            }
                        }]
                    }
                }]
            }
        };
        const data = {
            sections: [{
                title: 'Section 1',
                items: [{
                    name: 'Item 1'
                }]
            }]
        };
        expect(() => validateSchema(schema, true, data)).not.toThrow();
    });

    test('should throw error for undefined field in data', () => {
        const schema = {
            title: {
                FieldType: 'SingleLine',
                DisplayName: 'Title'
            }
        };
        const data = {
            title: 'Test Title',
            description: 'Test Description'
        };
        expect(() => validateSchema(schema, true, data))
            .toThrow('Property \'description\' in data is not defined in schema. Please ensure all data properties have corresponding schema definitions.');
    });

    test('should throw error when data field is array but schema field is not', () => {
        const schema = {
            items: {
                FieldType: 'SingleLine',
                DisplayName: 'Items'
            }
        };
        const data = {
            items: ['item1', 'item2']
        };
        expect(() => validateSchema(schema, true, data))
            .toThrow("Property 'items' in schema is not Array.");
    });

    test('should throw error when schema field is array but data field is not', () => {
        const schema = {
            items: {
                FieldType: 'Array',
                DisplayName: 'Items',
                Children: [{
                    name: {
                        FieldType: 'SingleLine',
                        DisplayName: 'Name'
                    }
                }]
            }
        };
        const data = {
            items: 'not an array'
        };
        expect(() => validateSchema(schema, true, data))
            .toThrow("Property 'items' in data is not Array.");
    });
});