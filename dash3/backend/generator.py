import random
import numpy as np
from faker import Faker

fake = Faker()

PARAMETER_RANGES = {
    'cutting_speed': (100, 500),
    'current_marking': (0.1, 2.5),
    'drilling': (0.5, 10.0),
    'technology_index': (1, 50),
    'tickness': (0.5, 25.0),
    'drilling_depth': (1.0, 15.0),
    'error_code': (1000, 9999),
    'error_level': (1, 5)
}

STATES = ['IDLE', 'RUN', 'WAIT', 'ERROR', 'STOP', 'OFFLINE']
PROGRAM_STATES = ['READY', 'ACTIVE', 'PAUSED', 'COMPLETE', 'ERROR']
TECHNOLOGY_NAMES = ['LASER_CUT', 'PLASMA_CUT', 'WATERJET', 'DRILLING', 'MARKING']
MATERIALS = ['STEEL', 'ALUMINUM', 'COPPER', 'STAINLESS_STEEL', 'BRASS']
GAS_TYPES = ['NITROGEN', 'OXYGEN', 'ARGON', 'AIR', 'CO2']
ERROR_MESSAGES = [
    'ARC_IGNITION_FAILED',
    'MATERIAL_THICKNESS_MISMATCH',
    'GAS_PRESSURE_LOW',
    'LASER_POWER_UNSTABLE',
    'COLLISION_DETECTED',
    'TEMPERATURE_EXCEEDED'
]

def generate_random_parameters(machine_id):
    state = random.choice(STATES)
    program_state = random.choice(PROGRAM_STATES)
    has_error = state == 'ERROR' or random.random() < 0.05

    return {
        'machine_id': machine_id,
        'state': state,
        'program_state': program_state if state in ['RUN', 'WAIT'] else 'READY',
        'current_marking': round(np.random.uniform(*PARAMETER_RANGES['current_marking']), 2) if state == 'RUN' else 0.0,
        'drilling': round(np.random.uniform(*PARAMETER_RANGES['drilling']), 1) if program_state == 'ACTIVE' else 0.0,
        'cutting_speed': round(np.random.uniform(*PARAMETER_RANGES['cutting_speed']), 1) if state == 'RUN' else 0.0,
        'override_flag': random.choice([True, False]),
        'homing': state == 'IDLE',
        'homed': random.choice([True, False]),
        'technology_name': random.choice(TECHNOLOGY_NAMES),
        'technology_index': random.randint(*PARAMETER_RANGES['technology_index']),
        'material': random.choice(MATERIALS),
        'tickness': round(np.random.uniform(*PARAMETER_RANGES['tickness']), 1),
        'gas_type': random.choice(GAS_TYPES),
        'arc': state == 'RUN' and random.choice([True, False]),
        'arc_ignite': state == 'RUN' and random.choice([True, False]),
        'drilling_depth': round(np.random.uniform(*PARAMETER_RANGES['drilling_depth']), 1),
        'scrap_cut': random.random() < 0.1,
        'din_file_name': f"program_{random.randint(1000, 9999)}.din",
        'arc_error': has_error and random.choice([True, False]),
        'error_code': random.randint(*PARAMETER_RANGES['error_code']) if has_error else None,
        'error_text': random.choice(ERROR_MESSAGES) if has_error else None,
        'error_parameter': fake.word().upper() if has_error else None,
        'error_level': random.randint(*PARAMETER_RANGES['error_level']) if has_error else 0
    }

def generate_multiple_machines(machine_ids):
    return [generate_random_parameters(mid) for mid in machine_ids]
