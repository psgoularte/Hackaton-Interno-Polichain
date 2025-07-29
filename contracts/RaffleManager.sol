// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AutoRaffle {
    address public owner;
    address public platform = 0x0fadE5b267b572dc1F002d1b9148976cCCE9C8C8; // Endereço da plataforma
    string public prizeDescription;
    uint256 public ticketPrice;
    uint256 public prizeValue;
    uint256 public endTime;
    uint256 public minParticipants;
    uint256 public minParticipantsDeadline;
    uint256 public maxTickets;
    
    uint256 public totalTicketsSold;
    mapping(address => uint256) public ticketsBought;
    address[] public participants;
    
    enum RaffleState { Active, Completed, Refunded, Cancelled }
    RaffleState public state;
    
    address public winner;
    uint256 public refundAmountPerTicket;
    
    event TicketPurchased(address buyer, uint256 quantity);
    event RaffleCompleted(address winner, uint256 prize, uint256 ownerProfit, uint256 platformFee);
    event RaffleRefunded();
    event RaffleCancelled();
    event RefundClaimed(address participant, uint256 amount);
    event MaxTicketsReached(uint256 maxTickets);
    
    constructor(
        string memory _prizeDescription,
        uint256 _ticketPrice,
        uint256 _prizeValue,
        uint256 _duration,
        uint256 _minParticipantsDuration,
        uint256 _maxTickets
    ) {
        require(_ticketPrice > 0, "Ticket price must be greater than 0");
        require(_prizeValue > 0, "Prize value must be greater than 0");
        require(_duration > 0, "Duration must be greater than 0");
        require(_maxTickets > 0, "Max tickets must be greater than 0");
        
        owner = msg.sender;
        prizeDescription = _prizeDescription;
        ticketPrice = _ticketPrice;
        prizeValue = _prizeValue;
        endTime = block.timestamp + _duration;
        minParticipantsDeadline = block.timestamp + _minParticipantsDuration;
        maxTickets = _maxTickets;
        state = RaffleState.Active;
        
        // Cálculo automático do mínimo de participantes: (prizeValue * 110%) / ticketPrice
        minParticipants = (_prizeValue * 11 + (_ticketPrice * 10) - 1) / (_ticketPrice * 10);
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyActive() {
        require(state == RaffleState.Active, "Raffle is not active");
        _;
    }
    
    function buyTicket(uint256 _quantity) external payable onlyActive {
        require(block.timestamp < endTime, "Raffle has ended");
        require(msg.value == ticketPrice * _quantity, "Incorrect ETH amount");
        require(_quantity > 0, "Quantity must be greater than 0");
        require(totalTicketsSold + _quantity <= maxTickets, "Exceeds maximum tickets limit");
        
        if (ticketsBought[msg.sender] == 0) {
            participants.push(msg.sender);
        }
        
        ticketsBought[msg.sender] += _quantity;
        totalTicketsSold += _quantity;
        
        emit TicketPurchased(msg.sender, _quantity);
        
        // Finaliza automaticamente se atingir o limite máximo de tickets
        if (totalTicketsSold >= maxTickets) {
            emit MaxTicketsReached(maxTickets);
            _completeRaffle();
            return;
        }
        
        // Finaliza antecipadamente se o mínimo foi atingido durante o período inicial
        if (totalTicketsSold >= minParticipants && block.timestamp < minParticipantsDeadline) {
            minParticipantsDeadline = block.timestamp;
        }
    }
    
    function cancelRaffle() external onlyOwner onlyActive {
        state = RaffleState.Cancelled;
        refundAmountPerTicket = ticketPrice;
        emit RaffleCancelled();
    }
    
    function claimRefund() external {
        require(state == RaffleState.Refunded || state == RaffleState.Cancelled, "No refund available");
        require(ticketsBought[msg.sender] > 0, "No tickets to refund");
        
        uint256 amountToRefund;
        if (state == RaffleState.Refunded) {
            amountToRefund = ticketsBought[msg.sender] * ticketPrice;
        } else { // Cancelled
            amountToRefund = ticketsBought[msg.sender] * refundAmountPerTicket;
        }
        
        ticketsBought[msg.sender] = 0;
        
        (bool success, ) = msg.sender.call{value: amountToRefund}("");
        require(success, "Refund transfer failed");
        
        emit RefundClaimed(msg.sender, amountToRefund);
    }
    
    function finalizeRaffle() external {
        require(block.timestamp >= endTime, "Raffle has not ended yet");
        require(state == RaffleState.Active, "Raffle already finalized");
        
        if (totalTicketsSold >= minParticipants || block.timestamp >= minParticipantsDeadline) {
            _completeRaffle();
        } else {
            _refundRaffle();
        }
    }
    
    function _completeRaffle() internal {
        // Sorteia o vencedor
        uint256 randomNumber = uint256(keccak256(abi.encodePacked(
            blockhash(block.number - 1), 
            block.timestamp,
            totalTicketsSold
        )));
        uint256 winningTicket = randomNumber % totalTicketsSold;
        winner = _determineWinner(winningTicket);
        
        // Transfere o prêmio
        (bool success, ) = winner.call{value: prizeValue}("");
        require(success, "Prize transfer failed");
        
        // Calcula os lucros (total - prêmio)
        uint256 totalProfit = address(this).balance;
        
        // Plataforma recebe 10%
        uint256 platformFee = totalProfit * 10 / 100;
        (success, ) = platform.call{value: platformFee}("");
        require(success, "Platform transfer failed");
        
        // Dono recebe os 90% restantes
        uint256 ownerProfit = address(this).balance;
        (success, ) = owner.call{value: ownerProfit}("");
        require(success, "Owner transfer failed");
        
        state = RaffleState.Completed;
        emit RaffleCompleted(winner, prizeValue, ownerProfit, platformFee);
    }
    
    function _refundRaffle() internal {
        state = RaffleState.Refunded;
        emit RaffleRefunded();
    }
    
    function _determineWinner(uint256 _winningTicket) internal view returns (address) {
        uint256 cumulativeTickets = 0;
        for (uint256 i = 0; i < participants.length; i++) {
            cumulativeTickets += ticketsBought[participants[i]];
            if (cumulativeTickets > _winningTicket) {
                return participants[i];
            }
        }
        return owner; // fallback (nunca deve acontecer se totalTicketsSold > 0)
    }
    
    function getParticipantsCount() public view returns (uint256) {
        return participants.length;
    }
    
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }
    
    function getRaffleState() public view returns (string memory) {
        if (state == RaffleState.Active) return "Active";
        if (state == RaffleState.Completed) return "Completed";
        if (state == RaffleState.Refunded) return "Refunded";
        return "Cancelled";
    }
    
    function getRefundAmount(address participant) public view returns (uint256) {
        if (state == RaffleState.Refunded) {
            return ticketsBought[participant] * ticketPrice;
        } else if (state == RaffleState.Cancelled) {
            return ticketsBought[participant] * refundAmountPerTicket;
        }
        return 0;
    }
    
    receive() external payable {
        revert("Please use the buyTicket function");
    }
}