import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-menu',
  imports:[CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  menuItems: any[] = [];
  filteredMenuItems: any[] = [];
  pagedMenuItems: any[] = [];
  categories: any[] = [];

  menuForm: FormGroup;
  editMode = false;
  editId: number | null = null;
  searchText = '';

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 0;

  constructor(private api: ApiService, private fb: FormBuilder) {
    this.menuForm = this.fb.group({
      name: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      categoryId: ['', Validators.required],
      isActive: [true]
    });
  }

  ngOnInit() {
    this.loadMenu();
    this.loadCategories();
  }

  loadMenu() {
    this.api.getMenu().subscribe(res => {
      this.menuItems = res;
      this.applyFilter(); // initialize pagination
    });
  }

  loadCategories() {
    this.api.getCategories().subscribe(res => this.categories = res);
  }

  submitForm() {
    if (this.menuForm.invalid) return;

    if (this.editMode && this.editId) {
      this.api.updateMenu({ id: this.editId, ...this.menuForm.value }).subscribe(() => {
        this.loadMenu();
        this.resetForm();
      });
    } else {
      this.api.addMenu(this.menuForm.value).subscribe(() => {
        this.loadMenu();
        this.resetForm();
      });
    }
  }

  editMenu(item: any) {
    this.editMode = true;
    this.editId = item.Id;
    this.menuForm.patchValue({
      name: item.Name,
      price: item.Price,
      categoryId: item.CategoryId,
      isActive: item.IsActive
    });
  }

  deleteMenu(id: number) {
    if (confirm('Are you sure you want to delete this menu item?')) {
      this.api.deleteMenu(id).subscribe(() => this.loadMenu());
    }
  }

  resetForm() {
    this.editMode = false;
    this.editId = null;
    this.menuForm.reset({ isActive: true });
  }

  // -------------------------------
  // SEARCH & PAGINATION METHODS
  // -------------------------------
  applyFilter() {
    const text = this.searchText.toLowerCase();
    this.filteredMenuItems = this.menuItems.filter(m =>
      m.Name.toLowerCase().includes(text) ||
      (m.CategoryName?.toLowerCase().includes(text)) ||
      (m.Price?.toString().includes(text))
    );

    this.totalPages = Math.ceil(this.filteredMenuItems.length / this.itemsPerPage);
    this.currentPage = 1;
    this.updatePagedMenuItems();
  }

  updatePagedMenuItems() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.pagedMenuItems = this.filteredMenuItems.slice(start, end);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagedMenuItems();
  }
}
