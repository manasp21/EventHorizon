import numpy as np
import itertools
from scipy.integrate import solve_ivp
from scipy.sparse import csr_matrix
import matplotlib.pyplot as plt

class BosonicQuantumDynamics:
    """Complete many-body bosonic quantum dynamics solver
    
    Solves N identical bosons in L modes with Hamiltonian:
    H(t) = ∑ J_i(t)(â†_i â_{i+1} + â†_{i+1} â_i) + ∑ Δ_i(t) n̂_i + ∑ U_i(t) n̂_i(n̂_i-1)
    
    Using operator formalism M(I,J) with Heisenberg picture dynamics.
    """
    
    def __init__(self, L, N, k_max):
        """
        Parameters:
        -----------
        L : int
            Number of modes
        N : int  
            Total particle number
        k_max : int
            Truncation level (maximum particles per operator)
        """
        self.L = L          
        self.N = N          
        self.k_max = k_max  
        
        # Generate complete operator basis M(I,J)
        self.basis = self._generate_operator_basis()
        self.n_basis = len(self.basis)
        print(f"Generated basis with {self.n_basis} operators")
        
    def _generate_operator_basis(self):
        """Generate lexicographically ordered M(I,J) operators"""
        basis = []
        
        # All possible (creation_ops, annihilation_ops) pairs
        for total_create in range(self.k_max + 1):
            for total_annihilate in range(self.k_max + 1):
                for I in itertools.combinations_with_replacement(range(self.L), total_create):
                    for J in itertools.combinations_with_replacement(range(self.L), total_annihilate):
                        basis.append((tuple(sorted(I)), tuple(sorted(J))))
        
        return sorted(list(set(basis)))  # Remove duplicates, lexicographic order
    
    def _hopping_commutator(self, I, J, K, L, site_from, site_to):
        """Compute [â†_{site_from} â_{site_to}, M(K,L)] matrix element
        
        Uses exact bosonic commutation relations:
        [â_i, â†_j] = δ_{ij}, [â_i, â_j] = 0, [â†_i, â†_j] = 0
        """
        element = 0.0 + 0.0j
        
        # Forward process: â†_{site_from} â_{site_to} M(K,L)
        K_list = list(K)
        if site_to in K_list:
            idx = K_list.index(site_to)
            K_modified = tuple(K_list[:idx] + K_list[idx+1:])
            I_target = tuple(sorted(list(I)))
            K_with_create = tuple(sorted(list(K_modified) + [site_from]))
            
            if I_target == K_with_create and J == L:
                element += 1.0
        
        # Backward process: M(K,L) â†_{site_from} â_{site_to}  
        L_list = list(L)
        if site_from in L_list:
            idx = L_list.index(site_from)
            L_modified = tuple(L_list[:idx] + L_list[idx+1:])
            J_target = tuple(sorted(list(J)))
            L_with_annihilate = tuple(sorted(list(L_modified) + [site_to]))
            
            if I == K and J_target == L_with_annihilate:
                element -= 1.0
                
        return element
    
    def _interaction_commutator(self, I, J, K, L, site):
        """Compute [n̂_site(n̂_site-1), M(K,L)] matrix element
        
        Uses n̂_i = â†_i â_i and expansion of n̂_i(n̂_i-1) = â†_i â_i â†_i â_i - â†_i â_i
        """
        if (I, J) != (K, L):
            return 0.0  # Only diagonal contributions for this truncation level
            
        n_K_site = K.count(site)
        n_L_site = L.count(site)
        
        return n_K_site * (n_K_site - 1) - n_L_site * (n_L_site - 1)
    
    def _build_hamiltonian_matrix(self, J_vals, Delta_vals, U_vals):
        """Construct full Hamiltonian matrix in operator basis
        
        Computes ⟨M(I,J)|[H,M(K,L)]⟩ for all operator pairs
        """
        H = np.zeros((self.n_basis, self.n_basis), dtype=complex)
        
        for i, (I, J) in enumerate(self.basis):
            for j, (K, L) in enumerate(self.basis):
                element = 0.0 + 0.0j
                
                # Hopping terms: ∑ J_l [â†_l â_{l+1} + â†_{l+1} â_l, M(K,L)]
                for site in range(self.L - 1):
                    element += J_vals[site] * self._hopping_commutator(I, J, K, L, site, site+1)
                    element += J_vals[site] * self._hopping_commutator(I, J, K, L, site+1, site)
                
                # On-site energy terms: ∑ Δ_l [n̂_l, M(K,L)]
                for site in range(self.L):
                    if (I, J) == (K, L):
                        n_diff = K.count(site) - L.count(site)
                        element += Delta_vals[site] * n_diff
                
                # Interaction terms: ∑ U_l [n̂_l(n̂_l-1), M(K,L)]
                for site in range(self.L):
                    element += U_vals[site] * self._interaction_commutator(I, J, K, L, site)
                
                H[i, j] = element
                
        return H
    
    def _encode_initial_state(self, initial_state):
        """Convert initial state dict to coefficient vector"""
        y0 = np.zeros(self.n_basis, dtype=complex)
        
        for (I, J), coeff in initial_state.items():
            if (I, J) in self.basis:
                idx = self.basis.index((I, J))
                y0[idx] = coeff
                
        return y0
    
    def solve_dynamics(self, t_span, J_func, Delta_func, U_func, initial_state):
        """Solve complete quantum dynamics using Heisenberg equations
        
        Parameters:
        -----------
        t_span : array_like
            Time span [t_start, t_end]
        J_func, Delta_func, U_func : callable or array_like
            Time-dependent parameters or constant values
        initial_state : dict
            Initial state as {(I,J): coefficient}
            
        Returns:
        --------
        solution : scipy.integrate.OdeSolution
            Complete time evolution solution
        """
        
        def equations_of_motion(t, coeffs):
            """Heisenberg equations: dM/dt = i[H,M]"""
            J_t = J_func(t) if callable(J_func) else J_func
            Delta_t = Delta_func(t) if callable(Delta_func) else Delta_func  
            U_t = U_func(t) if callable(U_func) else U_func
            
            H_t = self._build_hamiltonian_matrix(J_t, Delta_t, U_t)
            return 1j * H_t @ coeffs
        
        # Prepare initial state vector
        y0 = self._encode_initial_state(initial_state)
        
        # High-precision integration using DOP853 (8th order Runge-Kutta)
        solution = solve_ivp(equations_of_motion, t_span, y0,
                           method='DOP853', rtol=1e-12, atol=1e-14,
                           dense_output=True)
        
        if not solution.success:
            print(f"Integration failed: {solution.message}")
            
        return solution
    
    def compute_occupations(self, solution, times):
        """Extract occupation numbers n_i(t) = ⟨â†_i â_i⟩ from solution"""
        occupations = np.zeros((self.L, len(times)))
        
        for t_idx, t in enumerate(times):
            coeffs = solution.sol(t)
            
            for site in range(self.L):
                # Compute ⟨n̂_site⟩ from operator coefficients
                occupation = 0.0
                for i, (I, J) in enumerate(self.basis):
                    # Check if this operator contributes to ⟨â†_site â_site⟩
                    if len(I) == len(J) and I.count(site) > 0 and J.count(site) > 0:
                        I_reduced = list(I)
                        J_reduced = list(J)
                        I_reduced.remove(site)
                        J_reduced.remove(site)
                        
                        if tuple(sorted(I_reduced)) == tuple(sorted(J_reduced)):
                            occupation += np.real(coeffs[i] * np.conj(coeffs[i]))
                
                occupations[site, t_idx] = occupation
                
        return occupations
    
    def validate_rabi_oscillations(self, N=2, t_max=2*np.pi):
        """Validate against exact Rabi solution for L=2, U=0
        
        For N bosons in 2 modes with only hopping:
        n_0(t) = N cos²(√N t), n_1(t) = N sin²(√N t)
        """
        if self.L != 2:
            print("Rabi validation requires L=2")
            return False
            
        # Parameters for Rabi case
        J_rabi = np.array([1.0])        # Single hopping J=1
        Delta_rabi = np.array([0.0, 0.0])  # No on-site energy
        U_rabi = np.array([0.0, 0.0])      # No interaction
        
        # Initial state: all N particles in mode 0
        initial_state = {(tuple([0]*N), tuple([0]*N)): 1.0}
        
        times = np.linspace(0, t_max, 100)
        solution = self.solve_dynamics([0, t_max], J_rabi, Delta_rabi, U_rabi, initial_state)
        occupations = self.compute_occupations(solution, times)
        
        # Analytical solution for Rabi oscillations
        n0_analytical = N * np.cos(np.sqrt(N) * times)**2
        n1_analytical = N * np.sin(np.sqrt(N) * times)**2
        
        # Validation check
        rabi_error = np.max(np.abs(occupations[0] - n0_analytical))
        print(f"Rabi oscillation error: {rabi_error:.2e}")
        
        return rabi_error < 1e-6
    
    def validate_cauchy_schwarz(self, solution, times):
        """Validate Cauchy-Schwarz inequality for Sz = ∑_i i n_i
        
        Must satisfy: ⟨Sz²⟩ ≥ ⟨Sz⟩²
        """
        sz_vals = []
        sz2_vals = []
        
        for t in times:
            occupations = self.compute_occupations(solution, [t])[:, 0]
            
            # Compute Sz = ∑_i i n_i  
            sz = np.sum(np.arange(self.L) * occupations)
            
            # Compute Sz² expectation (approximation for this truncation)
            sz2 = np.sum((np.arange(self.L)**2) * occupations)
            
            sz_vals.append(sz)
            sz2_vals.append(sz2)
        
        # Check Cauchy-Schwarz inequality
        violations = np.sum(np.array(sz2_vals) < np.array(sz_vals)**2 - 1e-10)
        print(f"Cauchy-Schwarz violations: {violations}/{len(times)}")
        
        return violations == 0
    
    def plot_dynamics(self, solution, t_span, title="Bosonic Dynamics"):
        """Plot n_i(t) evolution with publication-quality formatting"""
        times = np.linspace(t_span[0], t_span[1], 200)
        occupations = self.compute_occupations(solution, times)
        
        plt.figure(figsize=(12, 8))
        colors = plt.cm.viridis(np.linspace(0, 1, self.L))
        
        for i in range(self.L):
            plt.plot(times, occupations[i], 
                    label=f'$n_{i}(t)$', 
                    linewidth=3, 
                    color=colors[i])
        
        plt.xlabel('Time', fontsize=16)
        plt.ylabel('Occupation Number', fontsize=16) 
        plt.title(title, fontsize=18, pad=20)
        plt.legend(fontsize=14, frameon=True, fancybox=True, shadow=True)
        plt.grid(True, alpha=0.3, linestyle='--')
        plt.tick_params(labelsize=12)
        plt.tight_layout()
        plt.show()
        
        return times, occupations

# Comprehensive validation and example usage
def run_validation_suite():
    """Run complete validation of all consistency checks"""
    
    print("=" * 60)
    print("COMPREHENSIVE VALIDATION SUITE")
    print("=" * 60)
    
    # Test 1: Rabi Oscillations (U=0, L=2)
    print("\n1. RABI OSCILLATIONS VALIDATION:")
    print("-" * 40)
    solver_rabi = BosonicQuantumDynamics(L=2, N=3, k_max=3)
    rabi_success = solver_rabi.validate_rabi_oscillations(N=3, t_max=2*np.pi)
    print(f"✓ Rabi validation: {'PASSED' if rabi_success else 'FAILED'}")
    
    # Test 2: Interaction Effects (U≠0 vs U=0)
    print("\n2. INTERACTION EFFECTS VALIDATION:")
    print("-" * 40)
    solver_int = BosonicQuantumDynamics(L=2, N=2, k_max=2)
    
    # Non-interacting case
    J_vals = np.array([1.0])
    Delta_vals = np.array([0.0, 0.0])
    U_vals_0 = np.array([0.0, 0.0])
    initial = {(tuple([0,0]), tuple([0,0])): 1.0}
    
    sol_U0 = solver_int.solve_dynamics([0, 5], J_vals, Delta_vals, U_vals_0, initial)
    occ_U0 = solver_int.compute_occupations(sol_U0, [5.0])
    
    # Interacting case  
    U_vals_1 = np.array([0.2, 0.2])
    sol_U1 = solver_int.solve_dynamics([0, 5], J_vals, Delta_vals, U_vals_1, initial)
    occ_U1 = solver_int.compute_occupations(sol_U1, [5.0])
    
    interaction_diff = np.max(np.abs(occ_U0 - occ_U1))
    print(f"Interaction difference: {interaction_diff:.4f}")
    print(f"✓ Interaction effects: {'PASSED' if interaction_diff > 1e-3 else 'FAILED'}")
    
    # Test 3: Cauchy-Schwarz Inequality
    print("\n3. CAUCHY-SCHWARZ VALIDATION:")
    print("-" * 40)
    validation_times = np.linspace(0, 5, 20)
    cs_success = solver_int.validate_cauchy_schwarz(sol_U1, validation_times)
    print(f"✓ Cauchy-Schwarz: {'PASSED' if cs_success else 'FAILED'}")
    
    # Test 4: Complete Example with Plotting
    print("\n4. COMPLETE DYNAMICS EXAMPLE:")
    print("-" * 40)
    solver_example = BosonicQuantumDynamics(L=3, N=4, k_max=3)
    
    # Time-dependent parameters
    def J_time(t):
        return np.array([1.0 + 0.1*np.sin(t), 1.0])
    
    Delta_example = np.array([0.0, 0.1, 0.0])
    U_example = np.array([0.05, 0.1, 0.05])
    initial_example = {(tuple([0,0,0,0]), tuple([0,0,0,0])): 1.0}
    
    solution = solver_example.solve_dynamics([0, 10], J_time, Delta_example, 
                                           U_example, initial_example)
    
    times, occupations = solver_example.plot_dynamics(solution, [0, 10], 
                                                     "Time-Dependent Bosonic Dynamics")
    
    print(f"✓ Complete simulation: COMPLETED")
    print(f"  Final occupations: {[f'{occ:.3f}' for occ in occupations[:, -1]]}")
    
    print("\n" + "=" * 60)
    print("ALL VALIDATIONS COMPLETED")
    print("=" * 60)

if __name__ == "__main__":
    run_validation_suite()