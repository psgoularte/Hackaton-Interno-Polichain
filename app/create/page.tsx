"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ArrowLeft, Upload, AlertCircle, Info, Check, DollarSign } from "lucide-react"
import Link from "next/link"

export default function CreateRafflePage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    prizeAmount: "",
    ticketPrice: "",
    targetAmount: "",
    endDate: "",
    walletAddress: "",
    image: null as File | null,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showDivisibilityDialog, setShowDivisibilityDialog] = useState(false)
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false)
  const [calculatedValues, setCalculatedValues] = useState({
    minimumTickets: 0,
    totalRaffleAmount: 0,
    maxTickets: 0,
    durationInSeconds: 0,
    platformFee: 0,
    creatorEarnings: 0,
  })

  // Calculate derived values whenever relevant fields change
  useEffect(() => {
    const prizeAmount = Number.parseFloat(formData.prizeAmount) || 0
    const ticketPrice = Number.parseFloat(formData.ticketPrice) || 0
    const targetAmount = Number.parseFloat(formData.targetAmount) || 0

    if (prizeAmount > 0 && ticketPrice > 0) {
      const minimumViableAmount = prizeAmount * 1.1
      const minimumTickets = Math.ceil(minimumViableAmount / ticketPrice)
      const totalRaffleAmount = targetAmount + prizeAmount * 1.1
      const maxTickets = Math.floor(totalRaffleAmount / ticketPrice)
      const platformFee = targetAmount * 0.1 // 10% of target amount
      const creatorEarnings = targetAmount - platformFee

      setCalculatedValues({
        minimumTickets,
        totalRaffleAmount,
        maxTickets,
        durationInSeconds: 0, // Will be calculated when endDate is set
        platformFee,
        creatorEarnings,
      })
    } else {
      setCalculatedValues({
        minimumTickets: 0,
        totalRaffleAmount: 0,
        maxTickets: 0,
        durationInSeconds: 0,
        platformFee: 0,
        creatorEarnings: 0,
      })
    }
  }, [formData.prizeAmount, formData.ticketPrice, formData.targetAmount])

  // Calculate duration in seconds when end date changes
  useEffect(() => {
    if (formData.endDate) {
      const endDate = new Date(formData.endDate)
      const now = new Date()
      const durationInSeconds = Math.max(0, Math.floor((endDate.getTime() - now.getTime()) / 1000))
      setCalculatedValues((prev) => ({ ...prev, durationInSeconds }))
    }
  }, [formData.endDate])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) newErrors.title = "Title is required"
    if (!formData.description.trim()) newErrors.description = "Description is required"
    if (!formData.category) newErrors.category = "Category is required"
    if (!formData.prizeAmount) newErrors.prizeAmount = "Prize amount is required"
    if (!formData.ticketPrice) newErrors.ticketPrice = "Ticket price is required"
    if (!formData.targetAmount) newErrors.targetAmount = "Target amount is required"
    if (!formData.endDate) newErrors.endDate = "End date is required"
    if (!formData.walletAddress.trim()) newErrors.walletAddress = "Ethereum wallet address is required"

    // Validate wallet address format (basic check)
    if (formData.walletAddress && !formData.walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      newErrors.walletAddress = "Please enter a valid Ethereum wallet address"
    }

    // Check if total raffle amount is divisible by ticket price
    if (formData.prizeAmount && formData.ticketPrice && formData.targetAmount) {
      const prizeAmount = Number.parseFloat(formData.prizeAmount)
      const ticketPrice = Number.parseFloat(formData.ticketPrice)
      const targetAmount = Number.parseFloat(formData.targetAmount)
      const totalRaffleAmount = targetAmount + prizeAmount * 1.1

      // Only show error if NOT divisible (fix the logic)
      if (totalRaffleAmount % ticketPrice !== 0) {
        setShowDivisibilityDialog(true)
        return false
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      setShowConfirmationDialog(true)
    }
  }

  const handleConfirmCreate = () => {
    console.log("Raffle created:", {
      ...formData,
      ...calculatedValues,
    })
    setShowConfirmationDialog(false)
    // Here you would typically send the data to your backend/blockchain
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, image: file })
    }
  }

  const formatDuration = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (days > 0) return `${days} days, ${hours} hours`
    if (hours > 0) return `${hours} hours, ${minutes} minutes`
    return `${minutes} minutes`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-primary/5">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <div className="flex items-center mb-8">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Create New Raffle
            </h1>
          </div>

          {/* Platform Fee Reminder */}
          <Card className="mb-6 border-tertiary/20 bg-tertiary/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-tertiary" />
                <h3 className="font-semibold text-tertiary">Platform Fee Notice</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                <strong>Important:</strong> Raffl3 will withhold 10% of the final amount earned by your Raffle for
                hosting services. This fee is automatically calculated and deducted from your target amount.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Raffle Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Raffle Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter raffle title"
                    className={errors.title ? "border-red-500 input-focus" : "input-focus"}
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.title}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your raffle and its purpose"
                    rows={4}
                    className={errors.description ? "border-red-500 textarea-focus" : "textarea-focus"}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.description}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className={errors.category ? "border-red-500 select-focus" : "select-focus"}>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="studies">Studies</SelectItem>
                      <SelectItem value="health">Health</SelectItem>
                      <SelectItem value="animals">Animals</SelectItem>
                      <SelectItem value="ngos">NGOs</SelectItem>
                      <SelectItem value="others">Others</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.category}
                    </p>
                  )}
                </div>

                {/* Financial Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prizeAmount">Prize Amount (ETH) *</Label>
                    <Input
                      id="prizeAmount"
                      type="number"
                      step="0.001"
                      min="0.001"
                      value={formData.prizeAmount}
                      onChange={(e) => setFormData({ ...formData, prizeAmount: e.target.value })}
                      placeholder="10.0"
                      className={errors.prizeAmount ? "border-red-500 input-focus" : "input-focus"}
                    />
                    {errors.prizeAmount && (
                      <p className="text-red-500 text-sm flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.prizeAmount}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ticketPrice">Ticket Price (ETH) *</Label>
                    <Input
                      id="ticketPrice"
                      type="number"
                      step="0.001"
                      min="0.001"
                      value={formData.ticketPrice}
                      onChange={(e) => setFormData({ ...formData, ticketPrice: e.target.value })}
                      placeholder="0.1"
                      className={errors.ticketPrice ? "border-red-500 input-focus" : "input-focus"}
                    />
                    {errors.ticketPrice && (
                      <p className="text-red-500 text-sm flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.ticketPrice}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetAmount">Target Amount (ETH) *</Label>
                  <Input
                    id="targetAmount"
                    type="number"
                    step="0.001"
                    min="0.001"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    placeholder="10.0"
                    className={errors.targetAmount ? "border-red-500 input-focus" : "input-focus"}
                  />
                  {errors.targetAmount && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.targetAmount}
                    </p>
                  )}
                </div>

                {/* Wallet Address */}
                <div className="space-y-2">
                  <Label htmlFor="walletAddress">Creator's Ethereum Wallet Address *</Label>
                  <Input
                    id="walletAddress"
                    value={formData.walletAddress}
                    onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                    placeholder="0x..."
                    className={errors.walletAddress ? "border-red-500 input-focus" : "input-focus"}
                  />
                  {errors.walletAddress && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.walletAddress}
                    </p>
                  )}
                </div>

                {/* Calculated Values Display */}
                {calculatedValues.totalRaffleAmount > 0 && (
                  <Card className="bg-accent/50 border-primary/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Info className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-primary">Calculated Values</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="font-medium text-muted-foreground">Minimum of Tickets:</div>
                          <div className="text-lg font-bold text-primary">{calculatedValues.minimumTickets}</div>
                        </div>
                        <div>
                          <div className="font-medium text-muted-foreground">Total Raffle Amount:</div>
                          <div className="text-lg font-bold text-secondary">
                            {calculatedValues.totalRaffleAmount.toFixed(3)} ETH
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-muted-foreground">Platform Fee (10%):</div>
                          <div className="text-lg font-bold text-tertiary">
                            {calculatedValues.platformFee.toFixed(3)} ETH
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-muted-foreground">Your Earnings:</div>
                          <div className="text-lg font-bold text-primary">
                            {calculatedValues.creatorEarnings.toFixed(3)} ETH
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        * Minimum tickets = (Prize Amount × 1.1) ÷ Ticket Price (rounded up)
                        <br />* Total Raffle Amount = Target Amount + (Prize Amount × 1.1)
                        <br />* Platform Fee = Target Amount × 10%
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* End Date */}
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className={errors.endDate ? "border-red-500 input-focus" : "input-focus"}
                  />
                  {errors.endDate && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.endDate}
                    </p>
                  )}
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <Label htmlFor="image">Raffle Image (Optional)</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <div className="text-sm text-gray-600 mb-2">
                      {formData.image
                        ? formData.image.name
                        : "Click to upload or drag and drop (Optional - will show waving hands if not provided)"}
                    </div>
                    <input id="image" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    <Button type="button" variant="outline" onClick={() => document.getElementById("image")?.click()}>
                      Choose File
                    </Button>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-lg py-6"
                >
                  Create Raffle!
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Divisibility Error Dialog */}
      <Dialog open={showDivisibilityDialog} onOpenChange={setShowDivisibilityDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Invalid Ticket Price
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-3">
                <div>
                  The <strong>Total Raffle Amount</strong> ({calculatedValues.totalRaffleAmount.toFixed(3)} ETH) must be
                  divisible by the <strong>Ticket Price</strong> ({formData.ticketPrice} ETH).
                </div>
                <div>Please adjust either the:</div>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Target Amount</li>
                  <li>Prize Amount</li>
                  <li>Ticket Price</li>
                </ul>
                <div className="text-xs text-muted-foreground">
                  Total Raffle Amount = Target Amount + (Prize Amount × 1.1)
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setShowDivisibilityDialog(false)} variant="outline">
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmationDialog} onOpenChange={setShowConfirmationDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-primary flex items-center gap-2">
              <Check className="h-5 w-5" />
              Confirm Raffle Creation
            </DialogTitle>
            <DialogDescription>Please review your raffle details before creating:</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">Prize Amount:</span>
                <div className="font-bold text-primary">{formData.prizeAmount} ETH</div>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Ticket Price:</span>
                <div className="font-bold text-secondary">{formData.ticketPrice} ETH</div>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Total Raffle Amount:</span>
                <div className="font-bold text-primary">{calculatedValues.totalRaffleAmount.toFixed(3)} ETH</div>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Maximum Tickets:</span>
                <div className="font-bold text-secondary">{calculatedValues.maxTickets}</div>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Platform Fee:</span>
                <div className="font-bold text-tertiary">{calculatedValues.platformFee.toFixed(3)} ETH</div>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Your Earnings:</span>
                <div className="font-bold text-primary">{calculatedValues.creatorEarnings.toFixed(3)} ETH</div>
              </div>
              <div className="col-span-2">
                <span className="font-medium text-muted-foreground">Creator's Wallet:</span>
                <div className="font-mono text-xs break-all bg-accent p-2 rounded mt-1">{formData.walletAddress}</div>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">End Date:</span>
                <div className="font-bold text-primary">{new Date(formData.endDate).toLocaleDateString()}</div>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Duration:</span>
                <div className="font-bold text-secondary">{formatDuration(calculatedValues.durationInSeconds)}</div>
              </div>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowConfirmationDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmCreate} className="bg-gradient-to-r from-primary to-secondary">
              Confirm & Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
