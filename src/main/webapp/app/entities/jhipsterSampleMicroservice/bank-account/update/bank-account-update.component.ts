import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { IBankAccount, BankAccount } from '../bank-account.model';
import { BankAccountService } from '../service/bank-account.service';

@Component({
  selector: 'jhi-bank-account-update',
  templateUrl: './bank-account-update.component.html',
})
export class BankAccountUpdateComponent implements OnInit {
  isSaving = false;

  editForm = this.fb.group({
    id: [],
    name: [null, [Validators.required]],
    balance: [null, [Validators.required]],
  });

  constructor(protected bankAccountService: BankAccountService, protected activatedRoute: ActivatedRoute, protected fb: FormBuilder) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ bankAccount }) => {
      this.updateForm(bankAccount);
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const bankAccount = this.createFromForm();
    if (bankAccount.id !== undefined) {
      this.subscribeToSaveResponse(this.bankAccountService.update(bankAccount));
    } else {
      this.subscribeToSaveResponse(this.bankAccountService.create(bankAccount));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IBankAccount>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(bankAccount: IBankAccount): void {
    this.editForm.patchValue({
      id: bankAccount.id,
      name: bankAccount.name,
      balance: bankAccount.balance,
    });
  }

  protected createFromForm(): IBankAccount {
    return {
      ...new BankAccount(),
      id: this.editForm.get(['id'])!.value,
      name: this.editForm.get(['name'])!.value,
      balance: this.editForm.get(['balance'])!.value,
    };
  }
}
