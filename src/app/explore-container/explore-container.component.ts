/* eslint-disable max-len */
import { Component, OnInit, Input } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-enterprise/secure-storage/ngx';

interface JsonObject {
  numberProp: number;
}

@Component({
  selector: 'app-explore-container',
  templateUrl: './explore-container.component.html',
  styleUrls: ['./explore-container.component.scss'],
})
export class ExploreContainerComponent implements OnInit {
  @Input() name: string;
  message = '';

  private db: SQLiteObject;
  private jsonData: JsonObject = { numberProp: 5 };

  constructor(private sqlite: SQLite) {}

  async getDB() {
    if (!this.db) {
      this.db = await this.sqlite.create({
        name: '_cgdb',
        location: 'default',
      });
      await this.createJsonDataTable(this.db);
    }

    return this.db;
  }

  ngOnInit() {}

  async getWithError() {
    const result = await this.getJsonDataBroken();

    this.message = result ? JSON.stringify(result) : 'Failed to retrieve data';
  }

  async getWithoutError() {
    const result = await this.getJsonData();

    this.message = result ? JSON.stringify(result) : 'Failed to retrieve data';
  }

  // #region jsonDataTable

  async createJsonDataTable(db: SQLiteObject) {
    try {
    await db.executeSql(`DROP TABLE jsonDataTable`, []);
    } catch {
      // Don't care if the table isn't there yet
    }

    await db.executeSql(
      `
        CREATE TABLE IF NOT EXISTS jsonDataTable (
          jsonData TEXT NOT NULL
        )`,
      []
    );

    await db.executeSql(
      'INSERT OR REPLACE INTO jsonDataTable (jsonData) VALUES (?)',
      [JSON.stringify(this.jsonData)]
    );
  }

  async getJsonData() {
    const db = await this.getDB();
    const result = await db.executeSql(
      `SELECT jsonData FROM jsonDataTable WHERE json_extract(jsonData, '$.numberProp')=${this.jsonData.numberProp}`,
      []
    );

    if (!result.rows.length) {
      return null;
    }

    return JSON.parse(result.rows.item(0).jsonData) as JsonObject;
  }

  async getJsonDataBroken() {
    const db = await this.getDB();
    const result = await db.executeSql(
      `SELECT jsonData FROM jsonDataTable WHERE json_extract(jsonData, '$.numberProp')=?`,
      [this.jsonData.numberProp]
    );

    if (!result.rows.length) {
      return null;
    }

    return JSON.parse(result.rows.item(0).jsonData) as JsonObject;
  }

  // #endregion
}
