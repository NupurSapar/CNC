import random
import time
import numpy as np
from faker import Faker
from datetime import datetime
from db import insert_machine_data

fake = Faker()

PARAMETER_RANGES = {
    'cutting_speed': (100, 600),
    'current': (0.1, 150.0),  # ✅ Changed from current_marking to current (amperes)
    'drilling': (0.5, 10.0),
    'technology_index': (1, 50),
    'thickness': (0.5, 25.0),  # ✅ Fixed spelling from 'tickness'
    'drilling_depth': (1.0, 15.0),
    'error_code': (1000, 9999),
    'error_level': (1, 5)
}

STATES = ['Idle', 'Running', 'Error', 'Stopped']
PROGRAM_STATES = ['READY', 'ACTIVE', 'PAUSED', 'COMPLETE', 'ERROR']
TECHNOLOGY_NAMES = ['LASER_CUT', 'PLASMA_CUT', 'WATERJET', 'DRILLING', 'MARKING']
MATERIALS = ['STEEL', 'ALUMINUM', 'COPPER', 'STAINLESS_STEEL', 'BRASS']
GAS_TYPES = ['NITROGEN', 'OXYGEN', 'ARGON', 'AIR', 'CO2']
TECHNOLOGY_DATASETS = ['DS_001', 'DS_002', 'DS_003', 'DS_004', 'DS_005']
ERROR_MESSAGES = [
    'ARC_IGNITION_FAILED',
    'MATERIAL_THICKNESS_MISMATCH',
    'GAS_PRESSURE_LOW',
    'LASER_POWER_UNSTABLE',
    'COLLISION_DETECTED',
    'TEMPERATURE_EXCEEDED',
    'HOMING_FAILED',
    'SERVO_ERROR',
    'CUTTING_HEAD_ERROR',
    'NOZZLE_CONTAMINATION'
]

machine_states = {}

def get_realistic_state_transition(machine_id, previous_state):
    if machine_id not in machine_states:
        machine_states[machine_id] = {
            'state': 'Idle',
            'state_duration': 0,
            'error_probability': 0.0015
        }
    
    machine_info = machine_states[machine_id]
    current_state = machine_info['state']
    state_duration = machine_info['state_duration']
    
    state_duration += 1
    
    if current_state == 'Running':
        if random.random() < 0.85:
            new_state = 'Running'
        elif random.random() < machine_info['error_probability']:
            new_state = 'Error'
        elif random.random() < 0.3:
            new_state = 'Idle'
        else:
            new_state = 'Stopped'
            
    elif current_state == 'Idle':
        if random.random() < 0.4 and state_duration > 3:
            new_state = 'Running'
        elif random.random() < 0.1:
            new_state = 'Stopped'
        else:
            new_state = 'Idle'
            
    elif current_state == 'Error':
        if state_duration > 5:
            new_state = 'Idle'
        else:
            new_state = 'Error'
            
    elif current_state == 'Stopped':
        if state_duration > 2:
            new_state = 'Idle'
        else:
            new_state = 'Stopped'
    else:
        new_state = 'Idle'
    
    if new_state != current_state:
        state_duration = 0
    
    machine_states[machine_id] = {
        'state': new_state,
        'state_duration': state_duration,
        'error_probability': machine_info['error_probability']
    }
    
    return new_state

def generate_random_parameters(machine_id):
    state = get_realistic_state_transition(machine_id, 
                                           machine_states.get(machine_id, {}).get('state', 'Idle'))
    
    has_error = (state == 'Error') or (random.random() < 0.02)
    
    if state == 'Running':
        program_state = random.choice(['ACTIVE', 'ACTIVE', 'ACTIVE', 'PAUSED'])
    elif state == 'Error':
        program_state = 'ERROR'
    elif state == 'Idle':
        program_state = random.choice(['READY', 'COMPLETE'])
    else:
        program_state = 'READY'
    
    technology_name = random.choice(TECHNOLOGY_NAMES)
    technology_index = random.randint(*PARAMETER_RANGES['technology_index'])
    
    material = random.choice(MATERIALS)
    thickness = round(np.random.uniform(*PARAMETER_RANGES['thickness']), 1)
    
    if state == 'Running':
        base_speed = np.random.uniform(*PARAMETER_RANGES['cutting_speed'])
        speed_factor = max(0.4, 1 - (thickness / 25))
        cutting_speed = round(base_speed * speed_factor, 1)
    else:
        cutting_speed = 0.0
    
    # ✅ Changed to current (amperes) - realistic values based on technology
    if state == 'Running':
        if technology_name == 'LASER_CUT':
            # Laser cutting typically uses 10-80A
            current = round(np.random.uniform(10, 80), 2)
        elif technology_name == 'PLASMA_CUT':
            # Plasma cutting uses higher current: 30-150A depending on thickness
            base_current = 30 + (thickness * 3)
            current = round(np.random.uniform(
                max(30, base_current - 15),
                min(150, base_current + 15)
            ), 2)
        elif technology_name == 'MARKING':
            # Marking uses lower current: 5-30A
            current = round(np.random.uniform(5, 30), 2)
        else:
            # Other technologies: 10-60A
            current = round(np.random.uniform(10, 60), 2)
    else:
        current = 0.0
    
    is_drilling = (technology_name == 'DRILLING' and state == 'Running')
    drilling = round(np.random.uniform(*PARAMETER_RANGES['drilling']), 1) if is_drilling else 0.0
    drilling_depth = round(np.random.uniform(*PARAMETER_RANGES['drilling_depth']), 1) if is_drilling else 0.0
    
    arc_active = (state == 'Running' and technology_name in ['LASER_CUT', 'PLASMA_CUT'])
    arc = arc_active and random.choice([True, False])
    arc_ignite = arc_active and random.choice([True, False])
    arc_error = has_error and random.random() < 0.3
    
    homing = (state == 'Idle' and random.random() < 0.1)
    homed = not homing and random.choice([True, True, True, False])
    
    error_code = None
    error_text = None
    error_parameter = None
    error_level = 0
    
    if has_error:
        error_code = random.randint(*PARAMETER_RANGES['error_code'])
        error_text = random.choice(ERROR_MESSAGES)
        error_parameter = fake.word().upper()
        error_level = random.randint(1, 5)
    
    return {
        'machine_id': machine_id,
        'state': state,
        'program_state': program_state,
        'current': current,  # ✅ Changed from current_marking
        'drilling': drilling,
        'cutting_speed': cutting_speed,
        'override_flag': random.choice([True, False]),
        'homing': homing,
        'homed': homed,
        'technology_name': technology_name,
        'technology_index': technology_index,
        'technology_dataset': random.choice(TECHNOLOGY_DATASETS),
        'material': material,
        'thickness': thickness,  # ✅ Fixed spelling
        'gas_type': random.choice(GAS_TYPES),
        'arc': arc,
        'arc_ignite': arc_ignite,
        'drilling_depth': drilling_depth,
        'scrap_cut': random.random() < 0.05,
        'din_file_name': f"program_{random.randint(1000, 9999)}.din",
        'arc_error': arc_error,
        'error_code': error_code,
        'error_text': error_text,
        'error_parameter': error_parameter,
        'error_level': error_level
    }

def generate_multiple_machines(machine_ids):
    return [generate_random_parameters(mid) for mid in machine_ids]

def run_continuous_generation(machine_ids, interval=2):
    print(f"Starting continuous data generation for machines: {machine_ids}")
    print(f"Generation interval: {interval} seconds")
    print("Press Ctrl+C to stop\n")
    
    iteration = 0
    
    try:
        while True:
            iteration += 1
            timestamp = datetime.now()
            
            machine_data = generate_multiple_machines(machine_ids)
            
            for data in machine_data:
                try:
                    insert_machine_data(data)
                    state_info = f"[{data['state']:8s}]"
                    speed_info = f"Speed: {data['cutting_speed']:6.1f}" if data['cutting_speed'] > 0 else "Speed:    0.0"
                    current_info = f"Current: {data['current']:6.2f}A" if data['current'] > 0 else "Current:   0.00A"
                    error_info = f" ERROR: {data['error_code']}" if data['error_code'] else ""
                    
                    print(f"{timestamp.strftime('%H:%M:%S')} | {data['machine_id']:12s} | "
                          f"{state_info} | {speed_info} | {current_info} | {data['material']:18s}{error_info}")
                    
                except Exception as e:
                    print(f"Error inserting data for {data['machine_id']}: {e}")
            
            print(f"--- Iteration {iteration} complete ---\n")
            
            time.sleep(interval + random.uniform(-0.2, 0.5))  # Adds jitter
            
    except KeyboardInterrupt:
        print("\n\nStopping data generation...")
        print(f"Total iterations: {iteration}")
        print("Data generation stopped successfully.")

if thickness < 5.0 and material in ['ALUMINUM', 'COPPER']:
       cutting_speed *= 1.1

if __name__ == "__main__":
    MACHINE_IDS = [
        'machine_1',
        'machine_2', 
        'machine_3'
    ]
    
    print("=" * 80)
    print("CNC Machine Data Generator")
    print("=" * 80)
    print(f"Generating data for {len(MACHINE_IDS)} machines")
    print(f"Machines: {', '.join(MACHINE_IDS)}")
    print("=" * 80)
    print()
    
    run_continuous_generation(MACHINE_IDS, interval=2)