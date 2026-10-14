// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vite-plus/test';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Studyset } from 'shared/types';
import ManageCategoriesDialog from './ManageCategoriesDialog';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (k: string) => k }),
}));

const toastError = vi.fn();
vi.mock('react-toastify', () => ({
    toast: { error: (...args: unknown[]) => toastError(...args) },
}));

type MutateOptions = { onSuccess?: () => void; onError?: () => void };
const mutateMock = vi.fn();
vi.mock('state/api/studysetsAPI', () => ({
    useUpdateStudyset: () => ({ mutate: mutateMock }),
}));

// "unused" is in categories but on no card, so Delete Unused will call the API.
const studyset = {
    studysetUUID: 'set-1',
    title: 'Set',
    categories: ['used', 'unused'],
    cards: [
        { cardUUID: 'c1', term: 'a', definition: 'b', categories: ['used'] },
    ],
} as unknown as Studyset;

const renderDialog = () =>
    render(
        <ThemeProvider theme={createTheme()}>
            <ManageCategoriesDialog
                open
                onClose={vi.fn()}
                selectedStudyset={studyset}
                studysets={[studyset]}
            />
        </ThemeProvider>
    );

describe('ManageCategoriesDialog - Delete Unused', () => {
    beforeEach(() => {
        toastError.mockClear();
        mutateMock.mockReset();
    });

    it('shows an error toast when the update fails', () => {
        mutateMock.mockImplementation((_vars: unknown, opts: MutateOptions) =>
            opts.onError?.()
        );
        renderDialog();
        fireEvent.click(
            screen.getByRole('button', { name: 'categories.deleteUnused' })
        );
        expect(mutateMock).toHaveBeenCalledTimes(1);
        expect(toastError).toHaveBeenCalledWith(
            'categories.deleteUnusedFailed'
        );
    });

    it('does not show an error toast when the update succeeds', () => {
        mutateMock.mockImplementation((_vars: unknown, opts: MutateOptions) =>
            opts.onSuccess?.()
        );
        renderDialog();
        fireEvent.click(
            screen.getByRole('button', { name: 'categories.deleteUnused' })
        );
        expect(mutateMock).toHaveBeenCalledTimes(1);
        expect(toastError).not.toHaveBeenCalled();
    });
});
