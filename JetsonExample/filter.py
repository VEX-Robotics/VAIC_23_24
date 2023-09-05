from collections import deque
import numpy as np

class LiveFilter:
    def __init__(self, window_size=5, output_file='filtered_data_simple.txt'):
        self.window_size = window_size
        self.x_buffer = deque(maxlen=window_size)
        self.y_buffer = deque(maxlen=window_size)
        self.output_file = output_file

    def update(self, x, y):
        # Update x and y buffers
        self.x_buffer.append(x)
        self.y_buffer.append(y)

        # Compute the average of the current buffer
        filtered_x = np.mean(self.x_buffer)
        filtered_y = np.mean(self.y_buffer)

        # Write the filtered data to an output file
        with open(self.output_file, 'a') as f:
            f.write(f"{filtered_x}, {filtered_y}\n")

        return filtered_x, filtered_y