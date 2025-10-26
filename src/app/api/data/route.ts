import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'public', 'scrum-data.json');

export async function GET() {
  try {
    if (fs.existsSync(dataFilePath)) {
      const data = fs.readFileSync(dataFilePath, 'utf8');
      console.log('Loaded data:', data);
      return NextResponse.json(JSON.parse(data));
    } else {
      console.log('File not found, returning empty');
      return NextResponse.json({ clientes: [], tasks: [] });
    }
  } catch (error) {
    console.error('Failed to load data:', error);
    return NextResponse.json({ error: 'Failed to load data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log('Saving data:', data);
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save data:', error);
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
}