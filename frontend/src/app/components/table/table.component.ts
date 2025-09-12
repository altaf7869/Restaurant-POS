import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { SearchFilterPipe } from '../../pipes/search-filter.pipe';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SearchFilterPipe],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit {
  tables: any[] = [];
  tableForm: FormGroup;
  editMode = false;
  editId: number | null = null;
searchText = '';
  constructor(private api: ApiService, private fb: FormBuilder) {
    // ✅ Change to tableNumber + seats (match backend)
    this.tableForm = this.fb.group({
      tableNumber: ['', Validators.required],
      seats: ['', [Validators.required, Validators.min(1)]],
      isActive: [true]
    });
  }

  ngOnInit() {
    this.loadTables();
  }

  loadTables() {
    this.api.getTables().subscribe(res => this.tables = res);
  }

  submitForm() {
    if (this.tableForm.invalid) return;

    if (this.editMode && this.editId) {
      this.api.updateTable({ id: this.editId, ...this.tableForm.value }).subscribe(() => {
        this.loadTables();
        this.resetForm();
      });
    } else {
      this.api.addTable(this.tableForm.value).subscribe(() => {
        this.loadTables();
        this.resetForm();
      });
    }
  }

  editTable(table: any) {
    this.editMode = true;
    this.editId = table.Id;
    this.tableForm.patchValue({
      tableNumber: table.TableNumber,
      seats: table.Seats,
      isActive: table.IsActive
    });
  }

  deleteTable(id: number) {
    if (confirm('Are you sure you want to delete this table?')) {
      this.api.deleteTable(id).subscribe(() => this.loadTables());
    }
  }

  resetForm() {
    this.editMode = false;
    this.editId = null;
    this.tableForm.reset({ isActive: true });
  }
}
