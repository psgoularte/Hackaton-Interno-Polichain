// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./RaffleManager.sol"; // Assumindo que o contrato AutoRaffle está em um arquivo separado

contract AutoRaffleFactory {
    address public owner;
    address public platform;
    
    // Array para armazenar todos os contratos de rifa criados
    address[] public allRaffles;
    
    // Mapeamento para verificar se um endereço é um contrato de rifa válido
    mapping(address => bool) public isRaffle;
    
    // Eventos
    event RaffleCreated(
        address indexed raffleAddress,
        address indexed creator,
        uint256 ticketPrice,
        uint256 prizeValue,
        uint256 duration,
        uint256 maxTickets
    );
    
    constructor(address _platform) {
        owner = msg.sender;
        platform = _platform;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    // Função principal para criar novas rifas
    function createRaffle(
        uint256 _ticketPrice,
        uint256 _prizeValue,
        uint256 _duration,
        uint256 _maxTickets
    ) external returns (address raffleAddress) {
        // Criar novo contrato de rifa
        AutoRaffle newRaffle = new AutoRaffle(
            _ticketPrice,
            _prizeValue,
            _duration,
            _maxTickets
        );
        
        // Transferir propriedade para o criador
        newRaffle.transferOwnership(msg.sender);
        
        // Armazenar o endereço do novo contrato
        raffleAddress = address(newRaffle);
        allRaffles.push(raffleAddress);
        isRaffle[raffleAddress] = true;
        
        emit RaffleCreated(
            raffleAddress,
            msg.sender,
            _ticketPrice,
            _prizeValue,
            _duration,
            _maxTickets
        );
        
        return raffleAddress;
    }
    
    // Função para obter o número total de rifas criadas
    function getRafflesCount() external view returns (uint256) {
        return allRaffles.length;
    }
    
    // Função para obter uma lista paginada de rifas
    function getRaffles(uint256 page, uint256 pageSize) external view returns (address[] memory) {
        require(page > 0, "Page must be greater than 0");
        require(pageSize > 0, "Page size must be greater than 0");
        
        uint256 start = (page - 1) * pageSize;
        if (start >= allRaffles.length) {
            return new address[](0);
        }
        
        uint256 end = start + pageSize;
        if (end > allRaffles.length) {
            end = allRaffles.length;
        }
        
        address[] memory result = new address[](end - start);
        for (uint256 i = start; i < end; i++) {
            result[i - start] = allRaffles[i];
        }
        
        return result;
    }
    
    // Função para atualizar o endereço da plataforma (apenas owner)
    function updatePlatformAddress(address _newPlatform) external onlyOwner {
        require(_newPlatform != address(0), "Invalid platform address");
        platform = _newPlatform;
    }
    
    // Função para transferir a propriedade do factory (apenas owner)
    function transferFactoryOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid owner address");
        owner = _newOwner;
    }
}