import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection
} from '@capacitor-community/sqlite';

const DB_NAME = 'estudio_plus';

@Injectable({ providedIn: 'root' })
export class DatabaseService {
  private sqlite: SQLiteConnection;
  private db!: SQLiteDBConnection;
  private initialized = false;

  constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
  }

  async initializeDatabase(): Promise<void> {
    if (this.initialized) return;

    try {
      if (Capacitor.getPlatform() === 'web') {
        await customElements.whenDefined('jeep-sqlite');
      }

      const retCC = await this.sqlite.checkConnectionsConsistency();
      const isConn = (await this.sqlite.isConnection(DB_NAME, false)).result;

      if (retCC.result && isConn) {
        this.db = await this.sqlite.retrieveConnection(DB_NAME, false);
      } else {
        this.db = await this.sqlite.createConnection(DB_NAME, false, 'no-encryption', 1, false);
      }

      await this.db.open();
      await this.createTables();
      this.initialized = true;
      console.log('Base de datos SQLite inicializada');
    } catch (err) {
      console.error('Error inicializando SQLite:', err);
      throw err;
    }
  }

  private async createTables(): Promise<void> {
    const schema = `
      CREATE TABLE IF NOT EXISTS asignaturas (
        id TEXT PRIMARY KEY,
        nombre TEXT NOT NULL,
        color TEXT NOT NULL,
        docente TEXT NOT NULL,
        descripcion TEXT
      );

      CREATE TABLE IF NOT EXISTS notas (
        id TEXT PRIMARY KEY,
        titulo TEXT NOT NULL,
        contenido TEXT,
        fecha_modificacion TEXT NOT NULL,
        sincronizada INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS materiales (
        id TEXT PRIMARY KEY,
        asignatura_id TEXT NOT NULL,
        titulo TEXT,
        tipo TEXT NOT NULL,
        url TEXT NOT NULL,
        fecha TEXT NOT NULL,
        sync INTEGER DEFAULT 0,
        FOREIGN KEY (asignatura_id) REFERENCES asignaturas(id)
      );

      CREATE TABLE IF NOT EXISTS recordatorios (
        id TEXT PRIMARY KEY,
        titulo TEXT NOT NULL,
        fecha_limite TEXT NOT NULL,
        prioridad TEXT NOT NULL,
        asignatura_id TEXT NOT NULL,
        completado INTEGER DEFAULT 0,
        FOREIGN KEY (asignatura_id) REFERENCES asignaturas(id)
      );

      CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tabla TEXT NOT NULL,
        operacion TEXT NOT NULL,
        datos TEXT NOT NULL,
        created_at TEXT NOT NULL,
        procesado INTEGER DEFAULT 0
      );
    `;

    await this.db.execute(schema);
  }

  async run(sql: string, values: any[] = []): Promise<any> {
    await this.ensureInitialized();
    return this.db.run(sql, values);
  }

  async query(sql: string, values: any[] = []): Promise<any[]> {
    await this.ensureInitialized();
    const result = await this.db.query(sql, values);
    return result.values || [];
  }

  async execute(sql: string): Promise<any> {
    await this.ensureInitialized();
    return this.db.execute(sql);
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initializeDatabase();
    }
  }
}
