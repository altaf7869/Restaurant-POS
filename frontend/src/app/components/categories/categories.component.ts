import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { SearchFilterPipe } from '../../pipes/search-filter.pipe';

@Component({
  selector: 'app-categories',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SearchFilterPipe],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css'
})
export class CategoriesComponent implements OnInit {
  categories: any[] = [];
  categoryForm: FormGroup;
  editMode = false;
  editId: number | null = null;
  searchText = '';

  constructor(private api: ApiService, private fb: FormBuilder) {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      isActive: [true]
    });
  }

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.api.getCategories().subscribe(res => this.categories = res);
  }

  submitForm() {
    if (this.categoryForm.invalid) return;

    if (this.editMode && this.editId) {
      this.api.updateCategory({ id: this.editId, ...this.categoryForm.value }).subscribe(() => {
        this.loadCategories();
        this.resetForm();
      });
    } else {
      this.api.addCategory(this.categoryForm.value).subscribe(() => {
        this.loadCategories();
        this.resetForm();
      });
    }
  }

  editCategory(category: any) {
    this.editMode = true;
    this.editId = category.Id;
    this.categoryForm.patchValue({
      name: category.Name,
      isActive: category.IsActive
    });
  }

  deleteCategory(id: number) {
    if (confirm('Are you sure you want to delete this category?')) {
      this.api.deleteCategory(id).subscribe(() => this.loadCategories());
    }
  }

  resetForm() {
    this.editMode = false;
    this.editId = null;
    this.categoryForm.reset({ isActive: true });
  }
}
