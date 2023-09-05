import { EventEmitter } from "events";
import { Convert, DataResponse, Offset } from "../lib/data-response";
import { config } from "../util/config";
import { commands } from "../lib/commands";

export interface DataService {
  on(event: "socketConnected", listener: () => void): this;
  on(event: "message", listener: (message: DataResponse) => void): this;
  on(event: "socketConnectionClosed", listener: () => void): this;
  on(event: "getCameraOffset", listener: (message: Offset) => void): this;
  on(event: "getGpsOffset", listener: (message: Offset) => void): this;
}

/**
 * Service to get data from the websocket server on the AI module
 */
export class DataService extends EventEmitter {
  private timer: NodeJS.Timer;
  private socket: WebSocket;
  public command: string;
  public ip: string;
  public port: string;

  /**
   * Constructor
   */
  constructor(_ip: string, _port: string) {
    super();
    this.ip = _ip;
    this.port = _port;
    this.timer = null;
    this.command = null;
    this.createSocketConnection();
  }

  /**
   * Creates a new WebSocket
   */
  public createSocketConnection = () => {
    this.socket = new WebSocket(`ws://${this.ip}:${this.port}`);

    this.socket.onopen = () => {
      this.emit("socketConnected");
      this.start();
    };

    this.socket.onmessage = (event: MessageEvent) => {
      try {
        const response = Convert.toDataResponse(event.data);
        if (config.logDataResponse) {
          console.log(response);
        }
        if (response) {
          if (response.command === commands.gGetCameraOffset) {
            this.emit("getCameraOffset", response.cameraOffset);
          } else if (response.command === commands.gGetGpsOffset) {
            this.emit("getGpsOffset", response.gpsOffset);
          } else {
            this.emit("message", response);
          }
        }
      } catch (ex) {
        console.log(`[DataService] Failed to parse incoming dataset: ${ex}`);
      }
    };

    this.socket.onclose = () => {
      this.emit("socketConnectionClosed");
    };
  };

  /**
   * Starts polling for data with a specified command
   *
   * Uses configurable polling interval
   */
  public start = () => {
    try {
      this.timer = setInterval(() => {
        this.send(this.command);
      }, config.pollingInterval);
    } catch (ex) {
      console.log(`[Data Service] Failed to start sending commands - ${ex}`);
    }
  };

  /**
   * Stops the service
   */
  public stop = () => {
    try {
      clearInterval(this.timer);
      this.socket.close();
    } catch (ex) {
      console.log(`[Data Service] Failed to stop the service - ${ex}`);
    }
  };

  /**
   * Restarts the service
   */
  public restart = () => {
    try {
      this.stop();
      this.createSocketConnection();
    } catch (ex) {
      console.log(`[Data Service] Failed to restart the service - ${ex}`);
    }
  };

  /**
   * Sends a message over the socket connection
   *
   * @param command The command to send to the websocket server to get specific data
   */
  public send = (command: string) => {
    try {
      if (this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(command);
      }
    } catch (ex) {
      console.log(`[Data Service] Failed to send websocket message - ${ex}`);
    }
  };

  /**
   *
   */
  public getCameraOffset = () => {
    try {
      this.socket.send(commands.gGetCameraOffset);
    } catch (ex) {
      console.log(`Failed to get camera offset ${ex}`);
    }
  };

  /**
   *
   */
  public getGpsOffset = () => {
    try {
      this.socket.send(commands.gGetGpsOffset);
    } catch (ex) {
      console.log(`Failed to get gps offset ${ex}`);
    }
  };

  /**
   *
   */
  public setCameraOffset = (offset: string) => {
    try {
      this.socket.send(`${commands.gSetCameraOffset},${offset}`);
    } catch (ex) {
      console.log(`Failed to set camera offset ${ex}`);
    }
  };

  /**
   *
   */
  public setGpsOffset = (offset: string) => {
    try {
      this.socket.send(`${commands.gSetGpsOffset},${offset}`);
    } catch (ex) {
      console.log(`Failed to set gps offset ${ex}`);
    }
  };

  /**
   * Is the service connected to the websocket server
   */
  public connected = (): boolean => {
    return this.socket.readyState === WebSocket.OPEN ? true : false;
  };
}
