import { createSlice } from "@reduxjs/toolkit";
import {
    addBankAccount,
    getMyBankAccounts,
    updateBankAccount,
    deleteBankAccount,
    setDefaultBankAccount,
    getVerificationStatus,
    type BankAccountResponse,
} from "./bankAccountThunk";

interface BankAccountState {
    accounts: BankAccountResponse[];
    loading: boolean;
    adding: boolean;
    updating: boolean;
    deleting: boolean;
    error: string | null;
    verificationStatuses: Record<string, { status: string; polling: boolean }>;
}

const initialState: BankAccountState = {
    accounts: [],
    loading: false,
    adding: false,
    updating: false,
    deleting: false,
    error: null,
    verificationStatuses: {},
};

const bankAccountSlice = createSlice({
    name: "bankAccount",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Add bank account
        builder
            .addCase(addBankAccount.pending, (state) => {
                state.adding = true;
                state.error = null;
            })
            .addCase(addBankAccount.fulfilled, (state, action) => {
                state.adding = false;
                state.accounts.unshift(action.payload);
                state.error = null;
            })
            .addCase(addBankAccount.rejected, (state, action) => {
                state.adding = false;
                state.error = action.payload?.message || "Failed to add bank account";
            });

        // Get my bank accounts
        builder
            .addCase(getMyBankAccounts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getMyBankAccounts.fulfilled, (state, action) => {
                state.loading = false;
                state.accounts = action.payload;
                state.error = null;
            })
            .addCase(getMyBankAccounts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to get bank accounts";
            });


        // Update bank account
        builder
            .addCase(updateBankAccount.pending, (state) => {
                state.updating = true;
                state.error = null;
            })
            .addCase(updateBankAccount.fulfilled, (state, action) => {
                state.updating = false;
                const index = state.accounts.findIndex((acc) => acc.id === action.payload.id);
                if (index !== -1) {
                    state.accounts[index] = action.payload;
                }
                state.error = null;
            })
            .addCase(updateBankAccount.rejected, (state, action) => {
                state.updating = false;
                state.error = action.payload?.message || "Failed to update bank account";
            });

        // Delete bank account
        builder
            .addCase(deleteBankAccount.pending, (state) => {
                state.deleting = true;
                state.error = null;
            })
            .addCase(deleteBankAccount.fulfilled, (state, action) => {
                state.deleting = false;
                state.accounts = state.accounts.filter((acc) => acc.id !== action.payload);
                state.error = null;
            })
            .addCase(deleteBankAccount.rejected, (state, action) => {
                state.deleting = false;
                state.error = action.payload?.message || "Failed to delete bank account";
            });

        // Set default bank account
        builder
            .addCase(setDefaultBankAccount.pending, (state) => {
                state.updating = true;
                state.error = null;
            })
            .addCase(setDefaultBankAccount.fulfilled, (state, action) => {
                state.updating = false;
                // Update all accounts: set the target account as default, others as false
                state.accounts = state.accounts.map((acc) => ({
                    ...acc,
                    isDefault: acc.id === action.payload.id,
                }));
                // Update the account details if it exists, otherwise add it
                const index = state.accounts.findIndex((acc) => acc.id === action.payload.id);
                if (index !== -1) {
                    state.accounts[index] = action.payload;
                } else {
                    state.accounts.push(action.payload);
                }
                state.error = null;
            })
            .addCase(setDefaultBankAccount.rejected, (state, action) => {
                state.updating = false;
                state.error = action.payload?.message || "Failed to set default bank account";
            });

        // Get verification status
        builder
            .addCase(getVerificationStatus.pending, (state, action) => {
                const accountId = action.meta.arg;
                state.verificationStatuses[accountId] = {
                    status: 'pending',
                    polling: true,
                };
            })
            .addCase(getVerificationStatus.fulfilled, (state, action) => {
                const accountId = action.meta.arg;
                state.verificationStatuses[accountId] = {
                    status: action.payload.status,
                    polling: action.payload.status === 'pending',
                };
                // Update account if verification is complete
                if (action.payload.status === 'verified' || action.payload.status === 'failed') {
                    const account = state.accounts.find(acc => acc.id === accountId);
                    if (account) {
                        account.verificationPaymentStatus = action.payload.status === 'verified' ? 'paid' : 'failed';
                        account.status = action.payload.status === 'verified' ? 'verified' : account.status;
                    }
                }
            })
            .addCase(getVerificationStatus.rejected, (state, action) => {
                const accountId = action.meta.arg;
                state.verificationStatuses[accountId] = {
                    status: 'error',
                    polling: false,
                };
            });
    },
});

export const { clearError } = bankAccountSlice.actions;
export default bankAccountSlice.reducer;

