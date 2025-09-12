import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { CommonModule } from '@angular/common';
import { SearchFilterPipe } from '../../../pipes/search-filter.pipe';

@Component({
  selector: 'app-users',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SearchFilterPipe],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']

})
export class UserComponent implements OnInit {
  users: any[] = [];
  userForm: FormGroup;
  editMode = false;
  editUserId: number | null = null;
  searchText = '';

  roles = ['Admin', 'Cashier', 'Waiter'];

  constructor(private api: ApiService, private fb: FormBuilder) {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      fullName: ['', Validators.required],
      role: ['Cashier', Validators.required]
    });
  }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.api.getUsers().subscribe(res => this.users = res);
  }

  submitForm() {
    if (this.userForm.invalid) return;

    if (this.editMode && this.editUserId) {
      const { fullName, role } = this.userForm.value;
      this.api.updateUser({ id: this.editUserId, fullName, role }).subscribe(() => {
        this.loadUsers();
        this.resetForm();
      });
    } else {
      this.api.addUser(this.userForm.value).subscribe(() => {
        this.loadUsers();
        this.resetForm();
      });
    }
  }

  editUser(user: any) {
    this.editMode = true;
    this.editUserId = user.Id;
    this.userForm.patchValue({
      username: user.Username,
      password: '',  // leave blank for security
      fullName: user.FullName,
      role: user.Role
    });
  }

  deleteUser(id: number) {
    if(confirm('Are you sure you want to delete this user?')) {
      this.api.deleteUser(id).subscribe(() => this.loadUsers());
    }
  }

  resetForm() {
    this.editMode = false;
    this.editUserId = null;
    this.userForm.reset({ role: 'Cashier' });
  }
}
