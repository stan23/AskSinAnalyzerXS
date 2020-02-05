import SerialPort from 'serialport';
import Stream from 'stream';
import SnifferParser from './SnifferParser';

class SerialIn {
  rawStream: Stream | null;
  telegramStream: Stream | null;
  con: SerialPort | null;

  async listPorts() {
    const ports = await SerialPort.list();
    ports.forEach(port => console.log(`Detected SerialPort: ${port.path} (${port.manufacturer || "unknown manufacturer"})`));
    return ports;
  }

  async open(port: string, baudRate: number = 57600): Promise<Stream> {
    try {
      await this.close();
    } catch (e) { }

    return new Promise((resolve, reject) => {
       this.con = new SerialPort(port, {baudRate}, (err: Error | null) => {
         if(err) return reject(err);
         this.rawStream = this.con.pipe(new SerialPort.parsers.Readline({delimiter: '\n'}));
         this.telegramStream = this.rawStream.pipe(new SnifferParser());
         resolve(this.telegramStream);
       });
    });
  }

  async close() {
    return new Promise((resolve, reject) => {
      this.con.close((err) => {
        if(err) return reject(err);
        resolve();
      })
    });
  }
}

// Singleton
export default new SerialIn();